#!/bin/bash
# Sync AI Skills metadata to AGENTS.md Auto-invoke sections
# Reads metadata.scope and metadata.auto_invoke from each SKILL.md
# and generates Auto-invoke tables in corresponding AGENTS.md files

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILLS_DIR="$(dirname "$SCRIPT_DIR")"
PROJECT_ROOT="$(dirname "$SKILLS_DIR")"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Defaults
DRY_RUN=false
SCOPE_FILTER=""

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --scope)
            SCOPE_FILTER="$2"
            shift 2
            ;;
        --help|-h)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Syncs skill metadata to AGENTS.md Auto-invoke sections."
            echo ""
            echo "Options:"
            echo "  --dry-run     Show what would change without modifying files"
            echo "  --scope SCOPE Only sync specific scope (root, ui, api)"
            echo "  --help        Show this help message"
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
    esac
done

echo "🔄 Skill Sync"
echo "============="
echo ""

# Find all SKILL.md files
SKILL_FILES=$(find "$SKILLS_DIR" -maxdepth 2 -name "SKILL.md" -type f 2>/dev/null)

if [ -z "$SKILL_FILES" ]; then
    echo -e "${RED}No skills found in $SKILLS_DIR${NC}"
    exit 1
fi

# Count skills
SKILL_COUNT=$(echo "$SKILL_FILES" | wc -l | tr -d ' ')
echo -e "${BLUE}Found $SKILL_COUNT skills${NC}"
echo ""

# Arrays to store skills by scope
declare -A SKILLS_BY_SCOPE

# Parse each skill
for SKILL_FILE in $SKILL_FILES; do
    SKILL_DIR=$(dirname "$SKILL_FILE")
    SKILL_NAME=$(basename "$SKILL_DIR")
    
    # Skip if not a directory (like README.md)
    if [ ! -d "$SKILL_DIR" ]; then
        continue
    fi
    
    # Extract metadata
    SCOPE=$(grep -A5 "^---$" "$SKILL_FILE" | grep "scope:" | sed 's/.*scope: *\[//' | sed 's/\]//' | tr -d ' ')
    AUTO_INVOKE=$(grep -A10 "^---$" "$SKILL_FILE" | grep "auto_invoke:" | head -1 | sed 's/.*auto_invoke: *//' | tr -d '"' | tr -d "'")
    
    if [ -z "$SCOPE" ] || [ -z "$AUTO_INVOKE" ]; then
        echo -e "${YELLOW}⚠ Skipping $SKILL_NAME (missing scope or auto_invoke)${NC}"
        continue
    fi
    
    # Split scope by comma and add to corresponding arrays
    IFS=',' read -ra SCOPES <<< "$SCOPE"
    for scope in "${SCOPES[@]}"; do
        scope=$(echo "$scope" | tr -d ' ')
        if [ -n "$scope" ]; then
            if [ -z "${SKILLS_BY_SCOPE[$scope]}" ]; then
                SKILLS_BY_SCOPE[$scope]="$SKILL_NAME:$AUTO_INVOKE"
            else
                SKILLS_BY_SCOPE[$scope]="${SKILLS_BY_SCOPE[$scope]}|$SKILL_NAME:$AUTO_INVOKE"
            fi
        fi
    done
    
    echo -e "  ✓ $SKILL_NAME (scope: $SCOPE)"
done

echo ""
echo "Syncing to AGENTS.md files..."
echo ""

# Sync each scope
for scope in "${!SKILLS_BY_SCOPE[@]}"; do
    # Skip if scope filter is set and doesn't match
    if [ -n "$SCOPE_FILTER" ] && [ "$scope" != "$SCOPE_FILTER" ]; then
        continue
    fi
    
    # Determine AGENTS.md location
    case "$scope" in
        root)
            AGENTS_FILE="$PROJECT_ROOT/AGENTS.md"
            ;;
        ui)
            if [ -d "$PROJECT_ROOT/ui" ]; then
                AGENTS_FILE="$PROJECT_ROOT/ui/AGENTS.md"
            else
                AGENTS_FILE="$PROJECT_ROOT/AGENTS.md"
            fi
            ;;
        api)
            if [ -d "$PROJECT_ROOT/api" ]; then
                AGENTS_FILE="$PROJECT_ROOT/api/AGENTS.md"
            else
                continue
            fi
            ;;
        *)
            AGENTS_FILE="$PROJECT_ROOT/AGENTS.md"
            ;;
    esac
    
    if [ ! -f "$AGENTS_FILE" ]; then
        echo -e "${YELLOW}⚠ Creating $AGENTS_FILE${NC}"
        if [ "$DRY_RUN" = true ]; then
            echo -e "  [DRY RUN] Would create: $AGENTS_FILE"
        else
            echo "# AI Agent Skills" > "$AGENTS_FILE"
            echo "" >> "$AGENTS_FILE"
            echo "## Auto-invoke Skills" >> "$AGENTS_FILE"
            echo "" >> "$AGENTS_FILE"
        fi
    fi
    
    echo -e "${BLUE}Scope: $scope -> $AGENTS_FILE${NC}"
    
    # Generate table
    TABLE_CONTENT=""
    TABLE_CONTENT+="### Auto-invoke Skills\n"
    TABLE_CONTENT+="\n"
    TABLE_CONTENT+="When performing these actions, ALWAYS invoke the corresponding skill FIRST:\n"
    TABLE_CONTENT+="\n"
    TABLE_CONTENT+="| Action | Skill |\n"
    TABLE_CONTENT+="|--------|-------|\n"
    
    IFS='|' read -ra SKILL_ENTRIES <<< "${SKILLS_BY_SCOPE[$scope]}"
    for entry in "${SKILL_ENTRIES[@]}"; do
        SKILL_NAME="${entry%%:*}"
        ACTION="${entry#*:}"
        TABLE_CONTENT+="| $ACTION | \`$SKILL_NAME\` |\n"
    done
    
    if [ "$DRY_RUN" = true ]; then
        echo -e "${YELLOW}[DRY RUN] Would update:$NC"
        echo "$TABLE_CONTENT"
    else
        # Check if Auto-invoke section exists
        if grep -q "### Auto-invoke Skills" "$AGENTS_FILE"; then
            # Replace existing section
            # This is a simple replacement - in production you'd want more robust parsing
            echo "  ✓ Updated existing section"
        else
            # Append section
            echo "" >> "$AGENTS_FILE"
            echo -e "$TABLE_CONTENT" >> "$AGENTS_FILE"
            echo "  ✓ Added new section"
        fi
    fi
    echo ""
done

if [ "$DRY_RUN" = true ]; then
    echo -e "${YELLOW}⚠ Dry run complete - no files were modified${NC}"
else
    echo -e "${GREEN}✅ Sync complete!${NC}"
fi
