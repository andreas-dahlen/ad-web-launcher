
## Remaining

- normalizeCssName (the function should be implemented)
- normalizeCssValue integration (the function should be implemented)
- generated identifier collision detection (throw)
- generated CSS variable collision detection (throw)



back-ground → backGround
back_ground → backGround
BACK_GROUND → backGround
2size → _2size


expect(parse.identifier("back-ground")).toBe("backGround")
expect(parse.identifier("back_ground")).toBe("backGround")
expect(parse.identifier("BACK_GROUND")).toBe("backGround")
expect(parse.identifier("2size")).toBe("_2size")