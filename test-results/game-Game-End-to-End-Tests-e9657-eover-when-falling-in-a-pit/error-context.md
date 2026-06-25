# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: game.spec.js >> Game End-to-End Tests >> should trigger gameover when falling in a pit
- Location: tests/e2e/game.spec.js:42:5

# Error details

```
Error: page.evaluate: TypeError: window.game.loadLevel is not a function
    at eval (eval at evaluate (:303:30), <anonymous>:2:25)
    at UtilityScript.evaluate (<anonymous>:305:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44)
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic: "Score: 0"
  - generic: Arrows to Move | Space to Jump | F to Fullscreen
  - button "Fullscreen" [ref=e2] [cursor=pointer]
```