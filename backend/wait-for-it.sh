#!/usr/bin/env bash
# wait-for-it.sh - Wait for a TCP host/port to become available

set -e

host="$1"
port="$2"
shift 2
cmd="$@"

echo "Waiting for $host:$port..."

while ! nc -z "$host" "$port"; do
  >&2 echo "Service $host:$port is unavailable - sleeping"
  sleep 1
done

>&2 echo "Service $host:$port is up - executing command"
exec $cmd
