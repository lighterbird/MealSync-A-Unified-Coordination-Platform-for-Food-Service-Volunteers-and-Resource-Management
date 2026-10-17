"""Validate primary keys, columns, and foreign-key references in schema.json.

Usage from the repository root:
    python scripts/check_schema_manifest.py
    python scripts/check_schema_manifest.py path/to/alternate_schema.json
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any


def validate_schema(schema: dict[str, Any]) -> list[str]:
    tables = schema.get("tables")
    if not isinstance(tables, dict) or not tables:
        raise ValueError("Top-level 'tables' must be a non-empty object.")

    errors: list[str] = []
    for table_name, spec in tables.items():
        attrs_list = spec.get("attributes", [])
        attrs = set(attrs_list)
        if len(attrs_list) != len(attrs):
            errors.append(f"{table_name}: duplicate column names in attributes.")
        if not attrs:
            errors.append(f"{table_name}: no attributes listed.")

        primary_key = spec.get("primary key", [])
        if not primary_key:
            errors.append(f"{table_name}: primary key is empty.")
        if len(set(primary_key)) != len(primary_key):
            errors.append(f"{table_name}: duplicate primary-key columns.")
        for col in primary_key:
            if col not in attrs:
                errors.append(f"{table_name}: PK column {col!r} is not in attributes.")

        column_types = spec.get("column_types", {})
        for col in attrs:
            if col not in column_types:
                errors.append(f"{table_name}: no column type/constraint annotation for {col!r}.")
        for col in column_types:
            if col not in attrs:
                errors.append(f"{table_name}: column_types contains unknown column {col!r}.")

        for constraint_group in ("unique_constraints",):
            for constraint in spec.get(constraint_group, []):
                for col in constraint:
                    if col not in attrs:
                        errors.append(f"{table_name}: {constraint_group} references unknown column {col!r}.")

        for fk_index, fk in enumerate(spec.get("foreign_keys", []), start=1):
            target = fk.get("references")
            local_cols = fk.get("columns", [])
            remote_cols = fk.get("referenced_columns", [])
            label = f"{table_name} FK#{fk_index}"
            if target not in tables:
                errors.append(f"{label}: target table {target!r} does not exist.")
                continue
            if not local_cols or len(local_cols) != len(remote_cols):
                errors.append(f"{label}: local/remote column lists are empty or have different lengths.")
            for col in local_cols:
                if col not in attrs:
                    errors.append(f"{label}: local column {col!r} does not exist in {table_name}.")
            target_attrs = set(tables[target].get("attributes", []))
            for col in remote_cols:
                if col not in target_attrs:
                    errors.append(f"{label}: remote column {col!r} does not exist in {target}.")
    return errors


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "schema_json_path",
        nargs="?",
        default=None,
        help="Optional alternate schema manifest path (default: ../database/schema.json).",
    )
    args = parser.parse_args()

    # Keep the default path in a variable so the repository layout is easy to change.
    repository_root = Path(__file__).resolve().parents[1]
    schema_json_path = Path(args.schema_json_path) if args.schema_json_path else repository_root / "database" / "schema.json"
    if not schema_json_path.is_absolute():
        schema_json_path = Path.cwd() / schema_json_path
    if not schema_json_path.is_file():
        raise FileNotFoundError(f"Schema manifest not found: {schema_json_path}")

    with schema_json_path.open("r", encoding="utf-8") as file:
        schema = json.load(file)
    errors = validate_schema(schema)
    if errors:
        print(f"Schema validation failed with {len(errors)} issue(s):")
        for error in errors:
            print(f" - {error}")
        raise SystemExit(1)
    print(f"OK: {len(schema['tables'])} tables validated in {schema_json_path}")


if __name__ == "__main__":
    main()
