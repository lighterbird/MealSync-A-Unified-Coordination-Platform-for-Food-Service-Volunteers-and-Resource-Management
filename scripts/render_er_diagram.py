"""Render the MealSync ER manifest as a Graphviz SVG and PNG.

Usage (from the repository root):
    python scripts/render_er_diagram.py

The schema JSON path is intentionally configured as a variable inside main(),
so it is straightforward to move the manifest without editing the renderer.
"""
from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from graphviz import Digraph

DOMAIN_GROUPS = {
    "Identity & locations": ["locations", "users", "roles", "user_roles", "notifications"],
    "Organizations, kitchens & events": [
        "organizations", "organization_members", "community_kitchens", "kitchen_members",
        "kitchen_hours", "events", "event_required_skills", "event_volunteers",
        "volunteer_referrals", "kitchen_event_requests",
    ],
    "Volunteers & external opportunities": [
        "skills", "volunteer_profiles", "volunteer_skills", "volunteer_availability",
        "opportunity_sources", "external_opportunities",
    ],
    "Donations": ["donation_requests", "donations"],
    "Inventory & procurement": [
        "ingredients", "kitchen_inventory", "inventory_transactions", "vendors",
        "vendor_ingredients", "purchase_orders", "purchase_order_items",
    ],
    "Recipes, meal planning & waste": [
        "recipes", "recipe_ingredients", "chefs", "meal_schedules", "meal_schedule_chefs",
        "meal_demand", "food_surplus", "food_wastage",
    ],
}
COLORS = {
    "Identity & locations": ("#174A3A", "#E8F3EE"),
    "Organizations, kitchens & events": ("#285E80", "#EAF3F8"),
    "Volunteers & external opportunities": ("#6C55A3", "#F0ECF8"),
    "Donations": ("#B96B2C", "#FCF0E4"),
    "Inventory & procurement": ("#477B45", "#EDF6E9"),
    "Recipes, meal planning & waste": ("#8D4969", "#F8ECF2"),
}


def _html_escape(value: Any) -> str:
    text = str(value)
    return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")


def _table_label(table_name: str, spec: dict[str, Any], domain_color: str, domain_fill: str) -> str:
    """Build an HTML-like Graphviz label listing every column and key marker."""
    pk = set(spec.get("primary key", []))
    fk_cols: set[str] = set()
    for fk in spec.get("foreign_keys", []):
        fk_cols.update(fk["columns"])

    rows = [
        f'<TR><TD COLSPAN="2" BGCOLOR="{domain_color}" ALIGN="LEFT" CELLPADDING="6">'
        f'<FONT COLOR="white"><B>{_html_escape(table_name)}</B></FONT></TD></TR>'
    ]
    for attribute in spec.get("attributes", []):
        marker = "PK/FK" if attribute in pk and attribute in fk_cols else "PK" if attribute in pk else "FK" if attribute in fk_cols else ""
        typ = spec.get("column_types", {}).get(attribute, "")
        rows.append(
            '<TR>'
            f'<TD ALIGN="LEFT" BGCOLOR="{domain_fill}"><FONT POINT-SIZE="9">{_html_escape(marker) if marker else "&#160;"}</FONT></TD>'
            f'<TD ALIGN="LEFT"><FONT POINT-SIZE="9">{_html_escape(attribute)}'
            f'{(" : " + _html_escape(typ)) if typ else ""}</FONT></TD>'
            '</TR>'
        )
    return '<<TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0" CELLPADDING="3">' + ''.join(rows) + '</TABLE>>'


def validate_schema(schema: dict[str, Any]) -> None:
    tables = schema.get("tables", {})
    if not tables:
        raise ValueError("Schema JSON must have a non-empty 'tables' object.")
    for table_name, spec in tables.items():
        attributes = set(spec.get("attributes", []))
        pk = spec.get("primary key", [])
        if not pk or not set(pk).issubset(attributes):
            raise ValueError(f"Table {table_name!r} has a missing/invalid primary key.")
        for fk in spec.get("foreign_keys", []):
            target = fk.get("references")
            if target not in tables:
                raise ValueError(f"Table {table_name!r} references missing table {target!r}.")
            if len(fk.get("columns", [])) != len(fk.get("referenced_columns", [])):
                raise ValueError(f"Table {table_name!r} has mismatched FK column counts: {fk}.")
            if not set(fk.get("columns", [])).issubset(attributes):
                raise ValueError(f"Table {table_name!r} has an FK column not present in its attributes: {fk}.")
            if not set(fk.get("referenced_columns", [])).issubset(set(tables[target].get("attributes", []))):
                raise ValueError(f"Table {table_name!r} references a missing column in {target!r}: {fk}.")


def build_graph(schema: dict[str, Any]) -> Digraph:
    tables = schema["tables"]
    graph = Digraph("MealSync_ER", format="svg")
    graph.attr(
        "graph",
        label="MealSync — Full Relational Schema (38 tables)",
        labelloc="t",
        labeljust="l",
        fontsize="22",
        fontname="Arial",
        rankdir="LR",
        splines="spline",
        overlap="false",
        compound="true",
        newrank="true",
        nodesep="0.28",
        ranksep="0.85",
        pad="0.25",
        bgcolor="white",
        outputorder="edgesfirst",
    )
    graph.attr("node", shape="plain", fontname="Arial", margin="0.03")
    graph.attr("edge", color="#85938D", penwidth="1.0", arrowsize="0.65", fontname="Arial", fontsize="7", fontcolor="#4B5B54")

    table_domain: dict[str, str] = {}
    grouped_names: set[str] = set()
    for domain, names in DOMAIN_GROUPS.items():
        present = [name for name in names if name in tables]
        if not present:
            continue
        grouped_names.update(present)
        color, fill = COLORS[domain]
        with graph.subgraph(name="cluster_" + str(len(table_domain))) as cluster:
            cluster.attr(
                label=domain,
                color=color,
                fontcolor=color,
                fontsize="13",
                fontname="Arial",
                style="rounded",
                penwidth="1.2",
                margin="12",
            )
            for table_name in present:
                table_domain[table_name] = domain
                cluster.node(table_name, label=_table_label(table_name, tables[table_name], color, fill), tooltip=tables[table_name].get("description", table_name))

    # Keep any future table visible instead of silently dropping it from the image.
    for table_name, spec in tables.items():
        if table_name not in grouped_names:
            domain = "Other / newly added"
            color, fill = ("#59636E", "#F0F2F4")
            table_domain[table_name] = domain
            graph.node(table_name, label=_table_label(table_name, spec, color, fill), tooltip=spec.get("description", table_name))

    # Draw one edge per FK; duplicate relationships are intentionally not collapsed.
    # Use parent -> child direction to read as "parent has many child records".
    for child_name, spec in tables.items():
        for fk in spec.get("foreign_keys", []):
            parent_name = fk["references"]
            local = ", ".join(fk["columns"])
            remote = ", ".join(fk["referenced_columns"])
            edge_label = f"{local} → {remote}"
            graph.edge(
                parent_name,
                child_name,
                label=edge_label,
                tooltip=f"{child_name}.{local} references {parent_name}.{remote}",
                minlen="1",
            )
    return graph


def main() -> None:
    # Change this variable if the JSON manifest is moved to a different location.
    repository_root = Path(__file__).resolve().parents[1]
    schema_json_path = repository_root / "database" / "schema.json"
    output_directory = repository_root / "docs"
    output_directory.mkdir(parents=True, exist_ok=True)

    with schema_json_path.open("r", encoding="utf-8") as file:
        schema = json.load(file)
    validate_schema(schema)
    graph = build_graph(schema)

    svg_base = output_directory / "ER_diagram"
    graph.format = "svg"
    svg_path = Path(graph.render(filename=str(svg_base), cleanup=True))
    png_graph = build_graph(schema)
    png_graph.format = "png"
    png_path = Path(png_graph.render(filename=str(output_directory / "ER_diagram"), cleanup=True))

    print(f"Validated {len(schema['tables'])} tables and rendered:")
    print(f"  SVG: {svg_path}")
    print(f"  PNG: {png_path}")


if __name__ == "__main__":
    main()
