import smartpy as sp

class Contract(sp.Contract):
  def __init__(self):
    self.init(myParameter1 = 1, myParameter2 = 151)

  @sp.entry_point
  def myEntryPoint(self, params):
    sp.verify(self.data.myParameter1 <= 123)
    self.data.myParameter1 += params