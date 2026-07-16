# What do I mean by Kernel

> The word kernel refers to the smallest executable part of CardOS.
>
> Everything else is considered a module.

(Keep in mind I'm a brêle in low level vocabulary and technicity so words I use might not stand for what they are. This project is not trying to replicate a traditional operating system architecture)

# The "game"

CardOS is not a "game" strictly speaking.

CardOS aims to be a runtime able to run code from modules that together define a card game.

Modules are distributed through npm packages. A package may provide one or multiple modules for anyone to use and make their own game rules.

The kernel should remain as small as possible.

Every time a new feature is proposed, the first question should be:

> Can this feature live outside the kernel?

If the answer is **yes**, it does not belong in the kernel.

# Responsibilities

As for now, the kernel is responsible for the orchestration of events.

Events are the primary runtime communication mechanism between modules and the kernel.
Modules can communicate through the public API but are free to expose richer APIs to other modules.

Kernel does not distinguish built-in events (if they even exist) from user-defined events.

Any module may create new event types.

# Ownership

The kernel does not own **game** state (cards, players, scores, turn logic, anything a rules module would define).

Modules are responsible for their own state.

The kernel only provides mechanisms for modules to communicate and coordinate.

That said, the kernel does own **runtime** state, this is a distinct category from game state, and it's worth being explicit about the line between the two:

- runtime state: which modules are loaded, their lifecycle phase, configuration, registered services, the RNG's internal state, the logical clock's current tick.
- game state: anything that describes the game being played.

The test: if any card games you can think of (say, poker, balatro, memories) need it to function, it's runtime state. If it's specific to what a given game means by "state", it's game state and belongs to a module.

The RNG is the clearest example of this, you'll see an example below.

# Trust

Modules execute arbitrary TypeScript (scary as shit).

CardOS does not sandbox mode.
A module has the same level of access as the process running it.

Installing a package means trusting its author.
Running it is like putting the author in front of your screen and keyboard.

This is a deliberate design choice.

One consequence worth noting: any guarantee the Kernel features offer (determinism, event contracts, and all) is more of a convention than a real guarantee.

A module can always bypass Kernel services and call `Math.random()` instead of the Kernel RNG since there is no sandbox to stop it.

# Questions

This said, I will address a few questions to my future self to ensure I will stay consistent.

## What part of the state does the Kernel own ?

Kernel should own runtime state.
The contrary seems impractical, it should know which modules are loaded, configuration, services etc.

It must remain minimal and should not have anything to do with game mechanics.

## What is the Kernel lifecycle ?

Kernel should have a lifecycle, but again it should remain minimal :

created
loading
loaded || ready
running
destroyed

This would imply a state of readiness for the modules too, as kernel needs to know what was loaded is ready to proceed to the running state.

## Who owns the gameloop ?

Kernel should only listen to events emitted from game loops owned by modules, it should not have its own gameloop.

## Does Kernel have a scheduler ?

In practice, yes, a minimal one. Providing a clock and callback handling is a scheduler, just a very small one.

Providing such a thing is what makes replay, rewind, and real full determinism possible at all.

This is a part of the code I won't ever be 100% sure of, but life is a highway.

## How does Kernel ensure determinism ?

Kernel should provide randomness through its runtime for games to be rewound, etc.

Also, determinism can be a hard thing to ensure when using multiple modules that could have conflicting code. My theory on that is that if we keep the same rule for event listeners to be processed by their own modules in the order they were loaded it should not be a problem.

## Does the Kernel validate game actions ?

The kernel validates runtime integrity, not game rules.

Concretely, runtime integrity covers :

- **Malformed events** : if the Kernel defines any structure for events to be correctly formed, it should be in charge of rejecting them. Whether it defines such a schema is still an open question.

- **Events with no listeners**: not an error, a module should be able to emit into the void, it should even be registered as a debug, or a warn level log.

- **A listener throwing an uncaught exception**: this is where the fun of this kernel is ! Isn't it exciting for user-written modules to just throw any exception they want and make everything crash ? (Please read the [trust section](#Trust))

## Final words

All of this thinking and procrastinating just for a few lines of code...
