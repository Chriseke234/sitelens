# AIGENSTRA — USER FLOW

## Primary User Journey (Idea to Code Prompt to Audit)

```mermaid
flowchart TD
    A["1. User has an Idea ('What are you building?')"] --> B["2. Aigenstra Understands Raw Idea"]
    B --> C["3. Adaptive Question Engine (Must-Know / Helpful / Optional)"]
    C --> D["4. User Answers (or selects 'I don't know')"]
    D --> E["5. Product Summary & Explicit Assumptions"]
    E --> F["6. Software Blueprint (Product, UX, Data, Security, Quality)"]
    F --> G["7. Build Map & Stage Decomposition"]
    G --> H["8. Task Selection"]
    H --> I["9. Context Engine (Relevant files & entities selected)"]
    I --> J["10. Token Optimization (Redundant data stripped)"]
    J --> K["11. Prompt Compiler (16-Part Agent-Specific Prompt)"]
    K --> L["12. User Copies/Exports Prompt"]
    L --> M["13. External Coding Agent (Antigravity, Cursor, Claude Code)"]
    M --> N["14. External Build Complete"]
    N --> O["15. Optional: Return to Aigenstra for Audit"]
    O --> P["16. Targeted Fix Prompts Generated"]
    P --> M
```

## Step-by-Step Stage Breakdown

### Stage 1: Idea Intake
- **User Action:** Enters raw, messy concept into a single focused input box.
- **System Action:** Identifies project archetype (SaaS, Marketplace, Web App, Tool, etc.) and establishes project workspace without premature conclusions.

### Stage 2: Adaptive Discovery & Clarification
- **User Action:** Answers minimal prioritized questions. Can click "I don't know" to accept sensible defaults.
- **System Action:** Identifies missing decisions, records provisional assumptions, and updates the structured Decision Log.

### Stage 3: Product Summary & Software Blueprint
- **User Action:** Reviews what they are building in plain language, with option to inspect expandable technical details.
- **System Action:** Generates comprehensive Blueprint covering journeys, screens, business rules, data schemas, integrations, and security threat vectors.

### Stage 4: Progressive Build Map & Task Breakdown
- **User Action:** Views the structured roadmap of stages and selects the current active task.
- **System Action:** Deconstructs product into manageable, sequential tasks with explicit prerequisites and acceptance criteria.

### Stage 5: Context Engine & Token Optimization
- **User Action:** Clicks "Generate Build Prompt" for the active task.
- **System Action:** Gathers only relevant schemas, routes, rules, and constraints for that task. Prunes unrelated context to minimize tokens and prevent AI confusion.

### Stage 6: Prompt Compilation & Agent Export
- **User Action:** Previews the structured prompt, selects target environment (e.g., Google Antigravity, Cursor, Claude Code), copies or downloads the prompt.
- **System Action:** Formats prompt according to the target agent profile, displays context inclusion rationale, and provides estimated token counts.

### Stage 7: Implementation & Closed-Loop Audit
- **User Action:** Runs prompt in their external AI IDE. Brings generated code/repo back to Aigenstra for verification.
- **System Action:** Audits implementation across security, architecture, UX, and performance; outputs concise, targeted fix prompts for any identified gaps.
