// version1 耦合严重，且不利于扩展
class Secretary {
  private observers: StockObserver[] = [];
  private action: string = '';

  attach (observer: StockObserver) {
    this.observers.push(observer);
  }

  notify () {
    this.observers.forEach(ob => {
      ob.update();
    });
  }

  getAction () {
    return this.action;
  }

  setAction (action: string) {
    this.action = action;
  }
}

class StockObserver {
  private name: string;
  private sub: Secretary;
  constructor (name: string, sub: Secretary) {
    this.name = name;
    this.sub = sub;
  }

  update () {
    console.log(`${this.sub.getAction()} ${this.name} 关闭股票行情，继续工作！`);
  }
}

function main () {
  const tongzizhe = new Secretary();
  const tongshi1 = new StockObserver('魏关查', tongzizhe);
  const tongshi2 = new StockObserver('易关查', tongzizhe);

  // 添加观察者
  tongzizhe.attach(tongshi1);
  tongzizhe.attach(tongshi2);

  tongzizhe.setAction('老板回来了！');

  // 发送通知
  tongzizhe.notify();
}

main()
