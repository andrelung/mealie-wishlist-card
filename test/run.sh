#!/bin/bash
# Mealie Wishlist: lokale Browser-Tests (Mock-hass, kein HA-Zugriff)
cd "$(dirname "$0")"
OUT="${TMPDIR:-/tmp}/mealie-wishlist-test"; mkdir -p "$OUT"
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
run note "step=note" 760
run note-ansicht "step=note&shot=1" 640
run minh "step=minh&cfg=%7B%22tile_min_height%22%3A120%7D" 900
run bilder "step=card&img=1&cfg=%7B%22url%22%3A%22https%3A%2F%2Frezepte.andrelung.de%22%2C%22tile_min_height%22%3A140%7D" 900 760
run opt-beide "step=noteopts&exp=NL&cfg=%7B%22url%22%3A%22https%3A%2F%2Fm.example%22%7D" 300
run opt-nur-notiz "step=noteopts&exp=N&cfg=%7B%22url%22%3A%22https%3A%2F%2Fm.example%22%2C%22allow_create_recipe%22%3Afalse%7D" 300
run opt-nur-link "step=noteopts&exp=L&cfg=%7B%22url%22%3A%22https%3A%2F%2Fm.example%22%2C%22allow_free_text%22%3Afalse%7D" 300
run opt-keine "step=noteopts&exp=&cfg=%7B%22url%22%3A%22https%3A%2F%2Fm.example%22%2C%22allow_free_text%22%3Afalse%2C%22allow_create_recipe%22%3Afalse%7D" 300
run mealie-an "step=openmealie&exp=true&cfg=%7B%22url%22%3A%22https%3A%2F%2Fm.example%22%7D" 300
run mealie-aus "step=openmealie&exp=false&cfg=%7B%22url%22%3A%22https%3A%2F%2Fm.example%22%2C%22allow_open_mealie%22%3Afalse%7D" 300
run pinned "step=pinned&cfg=%7B%22picker_items%22%3A12%2C%22pinned_category_ids%22%3A%5B%22c1%22%5D%2C%22pinned_notes%22%3A%5B%22Vorr%C3%A4te%20leer%20kochen%22%2C%22Frische%20Sachen%20shoppen%22%5D%7D" 900
run pinned-ansicht "step=pinned&shot=1&cfg=%7B%22picker_items%22%3A12%2C%22pinned_category_ids%22%3A%5B%22c1%22%5D%2C%22pinned_notes%22%3A%5B%22Vorr%C3%A4te%20leer%20kochen%22%2C%22Frische%20Sachen%20shoppen%22%5D%7D" 900
run naechstes "step=nextmeal&exp=Heute%20%C2%B7%20&nav=/mealie-wishlist&cfg=%7B%22meals%22%3A%5B%22dinner%22%5D%7D" 300 340
run naechstes-alle "step=nextmeal&exp=%C2%B7&cfg=%7B%7D" 300 340
run opt-mit-treffern "step=noteopts&q=gno&exp=NL&cfg=%7B%22url%22%3A%22https%3A%2F%2Fm.example%22%7D" 300
run focus "step=focus" 300
