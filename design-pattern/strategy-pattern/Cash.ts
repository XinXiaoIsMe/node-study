abstract class CashSuper {
  public abstract acceptCash(money: number): number;
}

class CashNormal extends CashSuper {
  public acceptCash(money: number) {
    return money;
  }
}

class CashRebase extends CashSuper {
  private rate: number;
  constructor (rate: number) {
    super();
    this.rate = rate;
  }

  public acceptCash(money: number) {
    return parseFloat((money * this.rate).toFixed(2));
  }
}

class CashReturn extends CashSuper {
  private moneyCondition: number;
  private moneyReturn: number;
  constructor (moneyCondition: number, moneyReturn: number) {
    super();
    this.moneyCondition = moneyCondition;
    this.moneyReturn = moneyReturn;
  }

  public acceptCash(money: number) {
    if (money >= this.moneyCondition) {
      return money - Math.floor(money / this.moneyCondition) * this.moneyReturn;
    }
    return money;
  }
}

class CashContext {
  public cs: CashSuper | null = null;
  constructor (type: string) {
    // 根据不同计费类型，选择不同策略
    switch (type) {
      case '正常收费':
        this.cs = new CashNormal();
        break;
      case '打8折':
        this.cs = new CashRebase(0.8);
        break;
      case '满100减10':
        this.cs = new CashReturn(100, 10);
        break;
      default:
        break;
    }
  }

  getResult (money: number) {
    return this.cs?.acceptCash(money);
  }
}

class Main {
  el: HTMLElement;
  productPrice: number = 0;
  productCount: number = 0;
  acceptCashType: string = '正常收费';
  constructor (container: string) {
    const oContainer = document.querySelector(container);
    if (!oContainer) {
      throw new Error('容器获取失败！');
    }

    this.el = oContainer as HTMLElement;
    this.bindEvent();
  }

  static init (container: string) {
    new Main(container)
  }

  bindEvent () {
    const oPriceInput = this.el.querySelector('.J_productPrice') as HTMLInputElement;
    const oCountInput = this.el.querySelector('.J_productCount') as HTMLInputElement;
    const oResetBtn = this.el.querySelector('.J_reset') as HTMLButtonElement;
    const oCalcBtn = this.el.querySelector('.J_calculate') as HTMLButtonElement;
    const oCashTypeSelect = this.el.querySelector('.J_acceptCashType') as HTMLSelectElement;
    const oCashResult = this.el.querySelector('.J_cashResult') as HTMLElement;

    const setResult = () => {
      // 和简单工厂模式相比，策略模式不再需要关注每个类，而是将所有计算逻辑抽象为策略
      // 再统合到CashContext类中，用户只需要关心CashContext类。大部分情况下setResult
      // 不会修改，扩展时只需要新增不同策略即可。而简单工厂模式由于返回的是类的实例，需要
      // 用户关注每个类中应该调用哪个函数，虽然使用基类和继承保证了函数的定义，但仍然带来
      // 额外的关注点。（个人理解：使用越简单越好，设计可以复杂）
      const cSuper = new CashContext(this.acceptCashType);
      if (cSuper) {
        const cash = cSuper.getResult(this.productCount * this.productPrice);
        oCashResult.innerText = String(cash);
      }
    }

    oPriceInput.addEventListener('input', (e) => {
      const tar = e.target as HTMLInputElement;
      this.productPrice = parseFloat(tar.value);
    });

    oCountInput.addEventListener('input', (e) => {
      const tar = e.target as HTMLInputElement;
      this.productCount = parseInt(tar.value);
    });

    oCashTypeSelect.addEventListener('change', (e) => {
      const tar = e.target as HTMLSelectElement;
      this.acceptCashType = tar.value;
    });

    oResetBtn.addEventListener('click', () => {
      this.productCount = 0;
      this.productPrice = 0;
      oPriceInput.value = '0';
      oCountInput.value = '0';
      setResult();
    });

    oCalcBtn.addEventListener('click', setResult);
  }
}

Main.init('.cash-platform');
