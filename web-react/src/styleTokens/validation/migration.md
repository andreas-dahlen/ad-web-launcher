


Generated identity collision (duplicate component + infix)
→ fatal

Generated variable collision (same generated CSS variable)
→ recover + warning

Allowed/exclude conflicts
→ recover + warning
→ exclude wins

Variable naming issues (ex kebab case, invalid characters, etc)
→ recover + warning
→ normalize or skip depending on severity


underscores? Probably fine (some_value → someValue)
numbers? Need rules (2d cannot become a TS identifier start)
reserved words? (default, class, function) need handling
empty after normalization? fatal

back-ground     → backGround
back_ground     → backGround
backGround      → backGround
BACK_GROUND     → backGround (if you choose)

Numbers are allowed except as the first character. 2size becomes _2size

Generated TS safety issues
→ handle earlier in pipeline
→ recover where possible