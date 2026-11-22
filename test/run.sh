#!/bin/bash
# Mealie Wishlist: lokale Browser-Tests (Mock-hass, kein HA-Zugriff)
cd "$(dirname "$0")"
OUT=out; mkdir -p "$OUT"
H="file://$PWD/harness.html"
run() { # name query height
  local t
  t=$(chromium --headless=new --no-sandbox --disable-gpu --virtual-time-budget=6000 --dump-dom "$H?$2" 2>/dev/null | grep -o '<title>[^<]*</title>')
  echo "$1: $t"
  chromium --headless=new --no-sandbox --disable-gpu --hide-scrollbars --force-device-scale-factor=2 --virtual-time-budget=6000 --window-size=${4:-700},${3:-760} --screenshot="$OUT/$1.png" "$H?$2" >/dev/null 2>&1
}
run card "step=card" 640
run card-light "step=card&theme=light" 640
run picker "step=picker" 900
run search "step=search" 640
run confirm "step=confirm&cfg=%7B%22confirm_wish%22%3Atrue%7D" 640
run commit "step=commit" 640
run details "step=details" 760
run remove "step=remove" 760
run change "step=change" 640
run einspaltig "step=card&w=380&cfg=%7B%22meals%22%3A%5B%22dinner%22%5D%2C%22days%22%3A5%2C%22show_header%22%3Atrue%2C%22subtitle%22%3A%22%22%7D" 640 440
run ohnekopf "step=card&cfg=%7B%22show_header%22%3Afalse%2C%22days%22%3A2%2C%22meals%22%3A%5B%22lunch%22%2C%22dinner%22%2C%22dessert%22%2C%22snack%22%2C%22drink%22%5D%7D" 360 900
run fehler "step=card&fail=1" 300
run picker-auswahl "step=picker&cfg=%7B%22picker%22%3A%5B%22random%22%2C%22search%22%5D%2C%22picker_items%22%3A3%7D" 640
run editor "step=editor" 300
run breit "step=card&w=1300&cfg=%7B%22meals%22%3A%5B%22lunch%22%2C%22snack%22%2C%22dinner%22%5D%2C%22show_header%22%3Afalse%7D" 640 1360
run schmal-3spalten "step=card&w=370" 900 420
run details-zu "step=remove" 760
run stable "step=stable" 900
run doremove "step=doremove" 760
