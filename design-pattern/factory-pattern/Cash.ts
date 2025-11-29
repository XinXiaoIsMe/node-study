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

class CashFactory {
  public static createCashAccept (type: string) {
    let cs: CashSuper | null = null;
    switch (type) {
      case '正常收费':
        cs = new CashNormal();
        break;
      case '打8折':
        cs = new CashRebase(0.8);
        break;
      case '满100减10':
        cs = new CashReturn(100, 10);
        break;
      default:
        break;
    }
    return cs;
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
      const cSuper = CashFactory.createCashAccept(this.acceptCashType);
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
