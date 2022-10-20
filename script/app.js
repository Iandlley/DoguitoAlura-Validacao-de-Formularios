import { validate } from "./validacao.js";

const inputs = document.querySelectorAll("input");

const args = {
    prefix: 'R$ ',
    fixed: true,
    fractionDigits: 2,
    decimalSeparator: ',',
    thousandsSeparator: '.',
    cursor: 'end'
  };

inputs.forEach((input) => {

    if(input.dataset.type === "price")
    {
        SimpleMaskMoney.setMask(input, args)
    }

    input.addEventListener("blur", (e)=> {
        validate(e.target);
    });
});