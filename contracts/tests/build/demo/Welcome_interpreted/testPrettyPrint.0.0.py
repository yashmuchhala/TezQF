import smartpy as sp

class Contract(sp.Contract):
  def __init__(self):
    self.init(myParameter1 = 12, myParameter2 = 123)

  @sp.entry_point
  def myEntryPoint(self, params):
    sp.verify(self.data.myParameter1 <= 123)
    self.data.myParameter1 += params