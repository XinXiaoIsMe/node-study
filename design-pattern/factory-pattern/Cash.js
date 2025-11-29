class CashSuper {
}
class CashNormal extends CashSuper {
    acceptCash(money) {
        return money;
    }
}
class CashRebase extends CashSuper {
    rate;
    constructor(rate) {
        super();
        this.rate = rate;
    }
    acceptCash(money) {
        return parseFloat((money * this.rate).toFixed(2));
    }
}
class CashReturn extends CashSuper {
    moneyCondition;
    moneyReturn;
    constructor(moneyCondition, moneyReturn) {
        super();
        this.moneyCondition = moneyCondition;
        this.moneyReturn = moneyReturn;
    }
    acceptCash(money) {
        if (money >= this.moneyCondition) {
            return money - Math.floor(money / this.moneyCondition) * this.moneyReturn;
        }
        return money;
    }
}
class CashFactory {
    static createCashAccept(type) {
        let cs = null;
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
    el;
    productPrice = 0;
    productCount = 0;
    acceptCashType = '正常收费';
    constructor(container) {
        const oContainer = document.querySelector(container);
        if (!oContainer) {
            throw new Error('容器获取失败！');
        }
        this.el = oContainer;
        this.bindEvent();
    }
    static init(container) {
        new Main(container);
    }
    bindEvent() {
        const oPriceInput = this.el.querySelector('.J_productPrice');
        const oCountInput = this.el.querySelector('.J_productCount');
        const oResetBtn = this.el.querySelector('.J_reset');
        const oCalcBtn = this.el.querySelector('.J_calculate');
        const oCashTypeSelect = this.el.querySelector('.J_acceptCashType');
        const oCashResult = this.el.querySelector('.J_cashResult');
        const setResult = () => {
            const cSuper = CashFactory.createCashAccept(this.acceptCashType);
            if (cSuper) {
                const cash = cSuper.acceptCash(this.productCount * this.productPrice);
                oCashResult.innerText = String(cash);
            }
        };
        oPriceInput.addEventListener('input', (e) => {
            const tar = e.target;
            this.productPrice = parseFloat(tar.value);
        });
        oCountInput.addEventListener('input', (e) => {
            const tar = e.target;
            this.productCount = parseInt(tar.value);
        });
        oCashTypeSelect.addEventListener('change', (e) => {
            const tar = e.target;
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
export {};
