#!/usr/bin/env bash
set -e

/opt/mssql/bin/sqlservr &

echo "Waiting for SQL Server to be available..."
for i in {1..60}; do
  if /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "${MSSQL_SA_PASSWORD}" -C -Q "SELECT 1" > /dev/null 2>&1; then
    break
  fi
  sleep 2
done

if ! /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "${MSSQL_SA_PASSWORD}" -C -Q "SELECT 1" > /dev/null 2>&1; then
  echo "SQL Server did not become ready in time" >&2
  exit 1
fi

echo "Running init scripts (if any)..."
shopt -s nullglob
for f in /docker-entrypoint-initdb.d/*.sql; do
  echo "Executing $f"
  /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "${MSSQL_SA_PASSWORD}" -C -i "$f"
done

wait