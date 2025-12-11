// version3 观察者模式
// 抽象出Observer类，进行解绑
// 抽象出Secretary类，进行解绑
abstract class Observer {
  protected name: string;
  protected sub: Subject;
  constructor (name: string, sub: Subject) {
    this.name = name;
    this.sub = sub;
  }

  abstract update(): void;
}

class StockObserver extends Observer {
  constructor (name: string, sub: Subject) {
    super(name, sub);
  }

  update () {
    console.log(`${this.sub.action} ${this.name} 关闭股票行情，继续工作！`);
  }
}

class NBAObserver extends Observer {
  constructor (name: string, sub: Subject) {
    super(name, sub);
  }

  update () {
    console.log(`${this.sub.action} ${this.name} 关闭NBA直播，继续工作！`);
  }
}

interface Subject {
  action: string;
  attach(observer: Observer): void;
  detach(observer: Observer): void;
  notify(): void;
}

class Secretary implements Subject {
  // 使用Observer基类，进行解绑
  private observers: Observer[] = [];
  private _action: string = '';

  attach (observer: Observer) {
    this.observers.push(observer);
  }

  detach(observer: Observer): void {
    this.observers = this.observers.filter(ob => ob === observer);
  }

  notify () {
    this.observers.forEach(ob => {
      ob.update();
    });
  }

  get action () {
    return this._action;
  }

  set action (value: string) {
    this._action = value;
  }
}

function main () {
  const tongzizhe = new Secretary();
  const tongshi1 = new StockObserver('魏关查', tongzizhe);
  const tongshi2 = new NBAObserver('易关查', tongzizhe);

  // 添加观察者
  tongzizhe.attach(tongshi1);
  tongzizhe.attach(tongshi2);

  tongzizhe.action = '老板回来了！';

  // 发送通知
  tongzizhe.notify();
}

main()
