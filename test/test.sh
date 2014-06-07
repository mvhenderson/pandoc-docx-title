#!/usr/bin/env bash

cd $(dirname "$0")

pandoc --version &> /dev/null \
  || (echo "Pandoc must be installed to run tests" && exit 0)

pandoc -o test-default.docx -F ../bin/docx-title.js test.md \
  || (echo "FAIL: default template" && exit 1)

pandoc -o test-custom.docx -F ../bin/docx-title.js -M docx-title=./title.xml test.md \
  || (echo "FAIL: custom template" && exit 1)

open -W *.docx
rm -f *.docx

