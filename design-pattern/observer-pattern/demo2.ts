// version2 
// 抽象出Observer类，进行解绑
// 但是Secretary仍然没有抽象，还可以抽象
abstract class Observer {
  protected name: string;
  protected sub: Secretary;
  constructor (name: string, sub: Secretary) {
    this.name = name;
    this.sub = sub;
  }

  abstract update(): void;
}

class StockObserver extends Observer {
  constructor (name: string, sub: Secretary) {
    super(name, sub);
  }

  update () {
    console.log(`${this.sub.getAction()} ${this.name} 关闭股票行情，继续工作！`);
  }
}

class NBAObserver extends Observer {
  constructor (name: string, sub: Secretary) {
    super(name, sub);
  }

  update () {
    console.log(`${this.sub.getAction()} ${this.name} 关闭NBA直播，继续工作！`);
  }
}

class Secretary {
  // 使用Observer基类，进行解绑
  private observers: Observer[] = [];
  private action: string = '';

  attach (observer: Observer) {
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

function main () {
  const tongzizhe = new Secretary();
  const tongshi1 = new StockObserver('魏关查', tongzizhe);
  const tongshi2 = new NBAObserver('易关查', tongzizhe);

  // 添加观察者
  tongzizhe.attach(tongshi1);
  tongzizhe.attach(tongshi2);

  tongzizhe.setAction('老板回来了！');

  // 发送通知
  tongzizhe.notify();
}

main()
