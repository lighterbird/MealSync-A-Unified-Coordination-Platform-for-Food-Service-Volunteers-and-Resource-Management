# Database notes

- `schema.json` is the full ER/documentation manifest consumed by `scripts/render_er_diagram.py`.
- Runtime schema evolution should be made via SQLAlchemy models and Flask-Migrate/Alembic revisions. Keep the JSON manifest and the ER output in sync with those revisions.
- `seed.sql` is reserved for deterministic, non-sensitive demo records (role/skill/ingredient lookup values and a few example entities). Never put real personal data or credentials in seed files.
- Before merging a model change, coordinate with the table owner in `team_ownership.json`; Person 1 integrates migrations.
