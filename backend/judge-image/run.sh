#!/bin/sh
cd /sandbox || exit 1
if [ -f Main.java ]; then
  javac Main.java 2> compile.err
  if [ $? -ne 0 ]; then cat compile.err; exit 2; fi
  /usr/bin/timeout 2s java Main < input.txt > output.txt 2> runtime.err
  exit_code=$?
  echo "EXIT:$exit_code"
  cat output.txt || true
else
  echo "No Main.java found" >&2
  exit 3
fi
