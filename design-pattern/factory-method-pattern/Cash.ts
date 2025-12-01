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

abstract class CashFactory {
  abstract createOperation(): CashSuper;
}

class CashNormalFactory extends CashFactory {
  createOperation(): CashSuper {
    return new CashNormal();
  }
}

class CashRebaseFactory extends CashFactory {
  createOperation(): CashSuper {
    return new CashRebase(0.8);
  }
}

class CashReturnFactory extends CashFactory {
  createOperation(): CashSuper {
    return new CashReturn(100, 10);
  }
}
/**
 * 普通工厂模式中，如果需要新增一个运算类，需要调整工厂方法，不符合开放-封闭原则
 * 调整成工厂函数模式，给每个运算类都新增一个工厂方法，当需要新增运算类的时候，只
 * 需要新增运行类和对应工厂方法，并在CashFactoryMap中的factoryMap里面新增运
 * 算类即可，不会涉及原有逻辑。
 */
class CashFactoryMap {
  static factoryMap: Record<string, new () => CashFactory> = {
    '正常收费': CashNormalFactory,
    '打8折': CashRebaseFactory,
    '满100减10': CashReturnFactory
  }

  static createCashAccept <T extends keyof typeof CashFactoryMap.factoryMap>(type: T) {
    const Factory = CashFactoryMap.factoryMap[type];
    if (Factory) {
      const factoryInstance = new Factory();
      const cSuper = factoryInstance.createOperation();
      return cSuper;
    }
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
      const cSuper = CashFactoryMap.createCashAccept(this.acceptCashType);
      if (cSuper) {
        const cash = cSuper.acceptCash(this.productCount * this.productPrice);
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
