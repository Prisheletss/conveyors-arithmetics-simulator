
"""
def edges_filler(count, symb):
    global edges_list

    for i in range(count):
        edges_list.append(f"{symb}{i}")





types = {
    'in': 1,
    'out': 1,
    's': 1,
    'a': 1
}


edges_list = []
edges_dict = {}

for i in types:
    edges_filler(types[i], i)

    if i in edges_dict.keys():
        edges_dict[i].append(edges_list[-1])
    else:
        edges_dict[i] = [edges_list[-1]]


conveyors_list = [
    [edges_dict['in'][0], edges_dict['out'][0]],
    [edges_dict['in'][0], edges_dict['s'][0]],
    [edges_dict['s'][0], edges_dict['a'][0]],
    [edges_dict['s'][0], edges_dict['a'][0]],
    [edges_dict['a'][0], edges_dict['out'][0]],
    [edges_dict['out'][0], edges_dict['in'][0]]
]







run = True
t = 0

while run:
"""  













class Edge:
    def __init__(self, name, tupe, inputs=[], outputs=[]):
        self.name = name
        self.type = tupe
        self.inputs = unputs
        self.outputs = outputs
        self.clock = 0

    def parse(self):
        self.clock += 1
        return self.clock




edges = [
    Edge('in', 'in', [], ['a1']),
    Edge('a1', 'in', [], ['a1']),
    Edge('in', 'in', [], ['a1']),
    Edge('in', 'in', [], ['a1']),
    Edge('in', 'in', [], ['a1']),
    Edge('in', 'in', [], ['a1'])
]
























































































