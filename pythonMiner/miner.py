import hashlib
import requests
from multiprocessing import Process, Manager
import random
import sys
import json
import time
import psutil


def proof_of_work(last_proof, difficulty, index, list):
    """
    Simple Proof of Work Algorithm
    Stringify the block and look for a proof.
    Loop through possibilities, checking each one against `valid_proof`
    in an effort to find a number that is a valid proof
    :return: A valid proof for the provided block
    """
    #     Simple Proof of Work Algorithm
    #     Stringify the block and look for a proof.
    #     Loop through possibilities, checking each one against `valid_proof`
    #     in an effort to find a number that is a valid proof
    #     :return: A valid proof for the provided block
    #     """
    #     # TODO

    print(f"Starting process {index}")
    guess = random.randint(0, 10000)
    not_valid = True
    while not_valid:
        if valid_proof(last_proof, difficulty, guess):
            not_valid = False
        else:
            guess += 1
    list[index] = guess
    print(f"Finish process {index}")


def valid_proof(last_proof: enumerate, difficutly, guess: enumerate):
    """
    Validates the Proof:  Does hash(block_string, proof) contain 6
    leading zeroes?  Return true if the proof is valid
    :param block_string: <string> The stringified block to use to
    check in combination with `proof`
    :param proof: <int?> The value that when combined with the
    stringified previous block results in a hash that has the
    correct number of leading zeroes.
    :return: True if the resulting hash is a valid proof, False otherwise
    """
    encoded = f'{last_proof}{guess}'.encode()
    guess_hash = hashlib.sha256(encoded).hexdigest()
    # return True or False
    s = ''
    leadingZeros = ["0"] * difficutly
    leadingZeros = s.join(leadingZeros)
    hashCompare = guess_hash[:difficutly]
    return hashCompare == leadingZeros


if __name__ == '__main__':
    # What is the server address? IE `python3 miner.py https://server.com/api/`

    if len(sys.argv) > 1:
        node = sys.argv[1]
    else:
        node = "https://lambda-treasure-hunt.herokuapp.com/api/bc"

    # Load ID
    f = open("my_id.txt", "r")
    id = f.read()
    print("ID is", id)
    f.close()
    random.seed(time.gmtime())
    count = 0
    proofs = []
    headers = {
        "Authorization": "Token bcff423ac6f6c8b0994654ccf917fb0c1e4699ca"}
    manager = Manager()

    l = manager.list([0] * 5)

    # Run forever until interrupted
    while True:
        r = requests.get(url = node + "/last_proof", headers = headers)
        # Handle non-json response
        try:
            data = r.json()
            if len(data['errors']) > 0:
                print(f"cooldown for {data['cooldown']}")
                time.sleep(data['cooldown'])
                continue
        except ValueError:
            print("Error:  Non-json response")
            print("Response returned:")
            print(r)
            break

        # TODO: Get the block from `data` and use it to look for a new proof
        processes = []
        for i in range(5):
            processes.append(Process(target = proof_of_work, args = (
                data['proof'], data['difficulty'], i, l)))
            processes[i].start()

        alive = True
        while alive:
            for i in range(5):
                if not processes[i].is_alive():
                    alive = False

        for i in range(5):
            if processes[i].is_alive():
                processes[i].terminate()
                processes[i].join()

        valid_guess = False
        for item in l:
            if item:
                valid_guess = item
        post_data = {"proof": valid_guess}

        r = requests.post(url = node + "/mine", json = post_data,
                          headers = headers)
        try:
            data = r.json()
            print(data)
        except ValueError:
            print(ValueError)

        # TODO: If the server responds with a 'message' 'New Block Forged'
        # add 1 to the number of coins mined and print it.  Otherwise,
        # print the message from the server.
        if data["cooldown"]:
            time.sleep(data['cooldown'])
