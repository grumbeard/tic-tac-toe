# The Odin Project
# Project #6: Tic Tac Toe

**Goal**: Create a a Tic Tac Toe game as part of The Odin Project [curriculum](https://www.theodinproject.com/paths/full-stack-javascript/courses/javascript/lessons/tic-tac-toe).

**Live Link**: 👉 https://grumbeard.github.io/tic-tac-toe/

## About
The main purpose of this assignment is to practice utilizing **Module Patterns and Factory Functions** (see [curriculum](https://www.theodinproject.com/paths/full-stack-javascript/courses/javascript/lessons/factory-functions-and-the-module-pattern)).
- The challenge is to limit global variables where possible (and sensible) and use closures to keep Modules relatively self-contained
- A major Design Pattern implemented is the Revealing Module Pattern

There are three parts to it:
1. Create Tic Tac Toe logic and interface allowing 2 players to take turns making a move, and evaluating the outcome after each move.
2. Create Start / Restart game controls and allow players to input their names.
3. [BROWNIE POINTS 🍪] Implement an **Unbeatable AI Computer Player** which selects the best move at each turn using the [minimax algorithm](https://en.wikipedia.org/wiki/Minimax).

## Features
In addition to all features above (see "About"), the following capabilities have been added:
- Selecting any or both players to be the 'Computer'
- Allowing players to play and keep score across multiple rounds

## Challenges
Summary: While implementing the Tic Tac Toe logic and interface was fairly straightforward, ensuring low coupling and high cohesion in the code design has been a difficult and fruitful endeavor. It has also been a great opportunity to learn about and practice the concept of recursion in the Minimax Algorithm.

### 1. Defining Module Responsibilities
- Assignment instructions suggested the creation of 3 modules: Game Board, Display Controller, and Game. However in my first build, the distribution of responsibilities across these 3 were unsatisfactory
- After adding a Game Controller module, the roles of these modules became a lot more clear:
  - Game Board: Manage access and changes to Game Board states
  - Display Controller: Render and manage changes to interface
  - Game: Define gameplay logic
  - Game Controller: Implement Gameplay Logic

### 2. Premature Optimization
- Some features were overengineered, such as allowing extensibility of the number of players or board size, unnecessarily complicating downstream implementation
- I had originally thought this was good practice, but it made the codebase unnecessarily more vulnerable to bugs and harder to maintain for the next guy because some of the code's necessity was not immediately apparent
- Apparently it's been called '[the root of all evil](http://wiki.c2.com/?PrematureOptimization)'

### 3. Understanding and Applying Minimax Algorithm
- It took about a week of reading and watching videos to understand how minimax works in turn-based games
- There was initial confusion about how terminal scores at the bottom of the game tree was obtained
- Most explanations talk about the process of evaluating the optimal paths after those terminal scores were already known
- Due to the unique way this Tic Tac Toe game evaluates outcomes, it was not as straightforward implementing minimax as other TTT games analysed
- It required tracking the state of multiple objects differently across iterations
- I chose not to revise my existing game evaluation logic so that I could learn more about how data is passed in a recursion

### Two basic things I learnt about JavaScript:
1. Arrays can't be compared directly
2. Objects can't be copied directly (returns a reference unless properly cloned)

## Screenshots
### Player (Salad) vs AI (Fried Chicken)
<img width="1024" alt="image" src="https://user-images.githubusercontent.com/51464365/117791049-8317dc80-b27c-11eb-9d61-0a46fd01d181.png">

