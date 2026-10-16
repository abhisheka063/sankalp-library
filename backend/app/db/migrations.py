from sqlalchemy import inspect, text

from .session import engine


def ensure_registration_payment_fields() -> None:
    """Apply small, idempotent schema upgrades for existing deployments."""
    inspector = inspect(engine)
    if "registrations" not in inspector.get_table_names():
        return

    existing = {column["name"] for column in inspector.get_columns("registrations")}
    with engine.begin() as connection:
        if "payment_mode" not in existing:
            connection.execute(text(
                "ALTER TABLE registrations ADD COLUMN payment_mode VARCHAR(16) NOT NULL DEFAULT 'Cash'"
            ))
        if "amount_due" not in existing:
            connection.execute(text(
                "ALTER TABLE registrations ADD COLUMN amount_due INTEGER NOT NULL DEFAULT 0"
            ))
        # Existing rows predate the price snapshot; backfill them from their plan.
        connection.execute(text(
            "UPDATE registrations SET amount_due = "
            "(SELECT fee_monthly FROM membership_plans "
            "WHERE membership_plans.id = registrations.plan_id) "
            "WHERE amount_due = 0 AND EXISTS "
            "(SELECT 1 FROM membership_plans WHERE membership_plans.id = registrations.plan_id)"
        ))
