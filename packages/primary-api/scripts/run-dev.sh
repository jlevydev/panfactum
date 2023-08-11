#!/usr/bin/env bash

OUT_DIR=$1

shift

while true; do
  "$@" & # start the process in the background
  inotifywait -r -e modify,create,delete "$OUT_DIR"
  >&2 echo "File change detected"
  pkill -f "$COMMAND_TO_RUN" # kill the process
done

