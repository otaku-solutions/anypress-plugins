#!/usr/bin/env bash
# Copies AnyPress Client's moving switches (forms, shop, CRM and the support, affiliate, community, course,
# Circle, Skool, Calendly and MemberPress imports) into Otaku Move for Fluent's lib/ folder, in its own namespace,
# text domain, option names and WP-CLI command, so the two plugins never load each other's classes or share state.
# lib/ is built, not kept in git: edit the switches in packages/anypress-client and run this again.
#
#   scripts/build-move.sh [<plugin folder>]   default: packages/otaku-move-for-fluent
set -euo pipefail

root=$(cd "$(dirname "$0")/.." && pwd)
client="$root/packages/anypress-client/src"
target=${1:-"$root/packages/otaku-move-for-fluent"}
lib="$target/lib"

rm -rf "$lib"
mkdir -p "$lib/Core"
cp -R "$client/Moving" "$client/Forms" "$client/Shop" "$client/Crm" "$lib/"
cp "$client/Core/FluentPlugin.php" "$lib/Core/"
# The HighLevel link belongs to AnyPress stores (it needs the store's site key), not to the switches.
rm -f "$lib/Crm/HighLevelLink.php"
# The Brevo and MailerLite importers in FluentCRM's Import screen need AnyPress Client's SDKs (its vendor/); they read
# online services, so they run on the store itself and Otaku Move for Fluent doesn't carry them.
rm -rf "$lib/Crm/Importers"
# FluentCart > Offers is an AnyPress Client screen, not a switch; nothing in the switches uses it.
rm -f "$lib/Shop/Offers.php"
# A wordpress.org plugin may not let remote clients run the switches: Otaku Move for Fluent registers no WordPress
# abilities, so the abilities classes stay in AnyPress Client. The switches run from Tools > Move to Fluent and WP-CLI.
rm -f "$lib"/*/*Abilities.php

find "$lib" -name '*.php' -print0 | while IFS= read -r -d '' file; do
  sed -i \
    -e 's/AnyPressClient\\/OtakuMove\\Lib\\/g' \
    -e "s/'anypress-client'/'otaku-move-for-fluent'/g" \
    -e 's/wp anypress /wp otaku-move /g' \
    -e 's/\banypress_client_/otaku_move_/g' \
    -e 's/\b_anypress_/_otaku_move_/g' \
    -e 's/\banypress_/otaku_move_/g' \
    -e 's/ AnyPress can rebuild them for you as part of its one-time move-in help (anypress\.io\/care)\.//g' \
    -e 's/AnyPress website MCP server/MCP server/g; s/On AnyPress websites/On hosted sites/g; s/AnyPress websites/hosted sites/g; s/AnyPress website/hosted site/g; s/AnyPress Client/this plugin/g; s/AnyPress stores\?/hosted store/g; s/AnyPress/the site/g' \
    -e '1a\
\
// Built by scripts/build-move.sh from the shared switches: edit those, not this copy.' \
    -e '/^namespace .*;$/a\
\
if (!defined('"'"'ABSPATH'"'"')) {\
    exit;\
}' \
    "$file"
done

# A wordpress.org plugin must not turn other plugins on: Otaku Move for Fluent has its own FluentPlugin that never does.
cp "$root/scripts/move/FluentPlugin.php" "$lib/Core/FluentPlugin.php"

left=$(grep -rliE "anypress|SiteAbilities" "$lib" || true)
[ -z "$left" ] || { echo "AnyPress names left in: $left" >&2; exit 1; }
abilities=$(grep -rlE "wp_register_ability|wp_abilities_api" "$lib" || true)
[ -z "$abilities" ] || { echo "Otaku Move for Fluent must not register abilities: $abilities" >&2; exit 1; }
turns_on=$(grep -rlE "activate_plugin|deactivate_plugins" "$lib" || true)
[ -z "$turns_on" ] || { echo "Otaku Move for Fluent must not change other plugins' activation: $turns_on" >&2; exit 1; }
echo "built $(find "$lib" -name '*.php' | wc -l | tr -d ' ') files into $lib"
