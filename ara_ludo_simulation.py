import random

class Player:
    def __init__(self, name, start_pos):
        self.name = name
        self.start_pos = start_pos
        self.pieces = [ -1, -1, -1, -1 ]  # -1 means in home
        self.home_count = 4

def print_board(players):
    board = ['.' for _ in range(52)]
    for player in players:
        symbol = player.name[0]
        for pos in [p for p in player.pieces if p != -1]:
            if board[pos] == '.':
                board[pos] = symbol
            else:
                board[pos] += symbol  # Stack if multiple, but rare
    print("Simplified Circular Board (positions 0-51):")
    for i in range(0, 52, 13):
        print(' '.join(board[i:i+13]))
    print()
    for player in players:
        print(f"{player.name}: In home: {player.home_count}, Positions: {[p for p in player.pieces if p != -1]}")
    print()

def is_safe(pos):
    safe_spots = [0, 13, 26, 39, 8, 21, 34, 47]  # Example safe spots
    return pos in safe_spots

def move_piece(player, piece_idx, steps, players):
    current = player.pieces[piece_idx]
    if current == -1:
        return False  # Can't move from home without 6
    new_pos = (current + steps) % 52
    # Check for capture
    for opp in [p for p in players if p != player]:
        for i, opp_pos in enumerate(opp.pieces):
            if opp_pos == new_pos and not is_safe(new_pos):
                opp.pieces[i] = -1
                opp.home_count += 1
                print(f"{player.name} captured {opp.name}'s piece at {new_pos}!")
    player.pieces[piece_idx] = new_pos
    return True

def play_turn(player, players, roll):
    print(f"{player.name} rolls a {roll}")
    moved = False
    # Prioritize moving existing pieces, or starting new if 6
    for i in range(4):
        if player.pieces[i] != -1:
            if move_piece(player, i, roll, players):
                moved = True
                break
    if not moved and roll == 6 and player.home_count > 0:
        # Start a new piece
        for i in range(4):
            if player.pieces[i] == -1:
                player.pieces[i] = player.start_pos
                player.home_count -= 1
                print(f"{player.name} moves a piece to position {player.start_pos}")
                moved = True
                break
    if not moved:
        print(f"{player.name} can't move any piece.")
    return moved

# Setup
players = [
    Player("Red", 0),
    Player("Green", 13),
    Player("Yellow", 26),
    Player("Blue", 39)
]

print("Ara Ludo Simulation by Omoluabi Productions!\n (Demo with predefined rolls to show moves)\n")
print_board(players)

# Predefined rolls for demo (to ensure some action)
rolls = [6, 3, 6, 2, 6, 4, 6, 5, 1, 6, 4, 3, 2, 6, 5, 4, 3, 2, 1, 6]
turn = 0
for i in range(20):  # Limit to 20 turns for brevity
    player = players[i % 4]
    print(f"Turn {i+1}: {player.name}'s turn")
    roll = rolls[i % len(rolls)]  # Cycle through predefined rolls
    play_turn(player, players, roll)
    print_board(players)

print("Simulation ended. Imagine this in a PWA with colorful graphics and online multiplayer!")