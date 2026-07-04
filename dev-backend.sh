#!/bin/bash
set -euo pipefail

PROJECT_ROOT="$HOME/dev/VoxelDash"
RUN_DIR="$PROJECT_ROOT/modules/vanilla/run"

# Wird von watchexec bei jeder Änderung neu aufgerufen (das ganze Skript läuft neu)
echo "=================================================="
echo "  [$(date +%H:%M:%S)] Baue VoxelDash Backend neu..."
echo "=================================================="

cd "$PROJECT_ROOT"

mvn -f modules/api/pom.xml install -DskipTests -q
mvn -f modules/vanilla/pom.xml package -DskipTests -Dskip.webui=true -q

echo "✅ Build erfolgreich."

mkdir -p "$RUN_DIR"
cd "$RUN_DIR"

# EULA automatisch akzeptieren, sonst stoppt der MC-Server sofort wieder.
# (Mit dem Ausführen dieses Skripts akzeptierst du selbst die Mojang EULA:
#  https://aka.ms/MinecraftEULA)
if [ ! -f eula.txt ] || ! grep -q "^eula=true" eula.txt; then
    echo "📜 Akzeptiere Minecraft EULA (eula.txt)..."
    echo "eula=true" > eula.txt
fi

JAR=$(ls "$PROJECT_ROOT"/modules/vanilla/target/voxeldash-vanilla-*.jar | grep -v sources | head -n1)

echo "🚀 Starte Backend: $JAR"
echo "--------------------------------------------------"
exec java -jar "$JAR"
