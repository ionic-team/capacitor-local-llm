# @capacitor/local-llm

Capacitor Local LLM plugin

## Install

```bash
npm install @capacitor/local-llm
npx cap sync
```

## API

<docgen-index>

* [`systemAvailability()`](#systemavailability)
* [`prompt(...)`](#prompt)
* [`endSession(...)`](#endsession)
* [Interfaces](#interfaces)
* [Enums](#enums)

</docgen-index>

<docgen-api>
<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->

### systemAvailability()

```typescript
systemAvailability() => Promise<SystemAvailabilityResponse>
```

**Returns:** <code>Promise&lt;<a href="#systemavailabilityresponse">SystemAvailabilityResponse</a>&gt;</code>

--------------------


### prompt(...)

```typescript
prompt(options: PromptOptions) => Promise<PromptResponse>
```

| Param         | Type                                                    |
| ------------- | ------------------------------------------------------- |
| **`options`** | <code><a href="#promptoptions">PromptOptions</a></code> |

**Returns:** <code>Promise&lt;<a href="#promptresponse">PromptResponse</a>&gt;</code>

--------------------


### endSession(...)

```typescript
endSession(options: EndSessionOptions) => Promise<void>
```

| Param         | Type                                                            |
| ------------- | --------------------------------------------------------------- |
| **`options`** | <code><a href="#endsessionoptions">EndSessionOptions</a></code> |

--------------------


### Interfaces


#### SystemAvailabilityResponse

| Prop         | Type                                                        |
| ------------ | ----------------------------------------------------------- |
| **`status`** | <code><a href="#llmavailability">LLMAvailability</a></code> |


#### PromptResponse

| Prop       | Type                |
| ---------- | ------------------- |
| **`text`** | <code>string</code> |


#### PromptOptions

| Prop               | Type                                              |
| ------------------ | ------------------------------------------------- |
| **`sessionId`**    | <code>string</code>                               |
| **`instructions`** | <code>string</code>                               |
| **`options`**      | <code><a href="#llmoptions">LLMOptions</a></code> |
| **`prompt`**       | <code>string</code>                               |


#### LLMOptions

| Prop                       | Type                |
| -------------------------- | ------------------- |
| **`temperature`**          | <code>number</code> |
| **`maximiumOutputTokens`** | <code>number</code> |


#### EndSessionOptions

| Prop            | Type                |
| --------------- | ------------------- |
| **`sessionId`** | <code>string</code> |


### Enums


#### LLMAvailability

| Members           | Value                      |
| ----------------- | -------------------------- |
| **`Available`**   | <code>'available'</code>   |
| **`Unavailable`** | <code>'unavailable'</code> |
| **`Unsupported`** | <code>'unsupported'</code> |
| **`NotEnabled`**  | <code>'notEnabled'</code>  |
| **`NotReady`**    | <code>'notReady'</code>    |

</docgen-api>
