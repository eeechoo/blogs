# yieldo.py
#
# Example of a coroutine-based scheduler

import time
from collections import deque
import heapq


class Scheduler:
    def __init__(self):
        self.ready = deque()
        self.current = None  # Currently executing generator
        self.sequence = 0

    def new_task(self, gen):
        self.ready.append(gen)

    def run(self):
        while self.ready:
            self.current = self.ready.popleft()
            # Drive as a generator
            try:
                self.current.send(None)
                if self.current:
                    self.ready.append(self.current)
            except StopIteration:
                pass


sched = Scheduler()  # Background scheduler object


class Awaitalble:
    def __await__(self):
        yield


def switch():
    return Awaitalble()


# ---- Example code

async def countdown(n):
    while n > 0:
        print('Down', n)
        time.sleep(1)
        await switch()
        n -= 1


async def countup(stop):
    x = 0
    while x < stop:
        print('Up', x)
        time.sleep(1)
        await switch()
        x += 1


sched.new_task(countdown(5))
sched.new_task(countup(5))
sched.run()
