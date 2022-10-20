export function validate(input) 
{
    const inputType = input.dataset.type;

    if (validators[inputType])
    {
        validators[inputType](input);
    }

    if(input.validity.valid) 
    {
        input.parentElement.classList.remove("input-container--invalido");
        input.parentElement.querySelector(".input-mensagem-erro").innerHTML = "";
    } 
    else 
    {
        input.parentElement.classList.add("input-container--invalido");
        input.parentElement.querySelector(".input-mensagem-erro").innerHTML = showErrorMessage(inputType, input);
    };
};

const errorTypes = [
    "valueMissing", "typeMismatch", "patternMismatch", "customError"
];

const errorMessages = {
    name: {
        valueMissing: "O campo nome não pode estar vazio"
    },
    email: {
        valueMissing: "O campo email não pode estar vazio",
        typeMismatch: "O email digitado não é válido"
    },
    password: {
        valueMissing: "O campo senha não pode estar vazio",
        patternMismatch: "A senha deve conter de 6 a 12 caracteres, pelo menos uma letra maiúscula, um número e não deve conter símbolos"
    },
    birthDate: {
        valueMissing: "O campo de data de nascimento não pode estar vazio",
        customError: "Você deve ter pelo menos 18 anos para se cadastrar" 
    },
    cpf: {
        valueMissing: "O campo de cpf não pode estar vazio",
        customError: "O CPF digitado não é válido" 
    },
    cep: {
        valueMissing: "O campo de CEP não pode estar vazio",
        patternMismatch: "O CEP digitado não é válido",
        customError: "Não foi possível buscar o CEP"
    },
    logradouro: {
        valueMissing: "O campo de logradouro não pode estar vazio",
    },
    city: {
        valueMissing: "O campo de cidade não pode estar vazio",
    },
    state: {
        valueMissing: "O campo de estado não pode estar vazio",
    },
    price: {
        valueMissing: "O campo de preço não pode estar vazio"
    }
};

function showErrorMessage(inputType, input)
{
    let message = "";

    errorTypes.forEach((error) => {
        if(input.validity[error])
        {
            message = errorMessages[inputType][error];
        };
    });

    return message;
}

const validators = {
    birthDate:input => checkBirthDate(input),
    cpf:input => validateCPF(input),
    cep:input => getCEP(input),
};

function checkBirthDate(dateInp)
{
    const receivedDate = new Date(dateInp.value);
    let message = "";

    if(!isAbove18(receivedDate)){
        message = "Você deve ter pelo menos 18 anos para se cadastrar";
    }

    dateInp.setCustomValidity(message);
};

function isAbove18(date)
{
    const currentDate = new Date();
    const receivedDate = new Date(date.getUTCFullYear() + 18, date.getUTCMonth(), date.getUTCDate());

    return receivedDate <= currentDate; 
};

function validateCPF(input)
{
    const formatedCPF = input.value.replace(/\D/g, "");

    let message = "";

    if(!checkRepeatedCPF(formatedCPF) || !checkCpfStructure(formatedCPF)) {
        message = "O CPF digitado não é válido";
    };

    input.setCustomValidity(message); 
};

function checkRepeatedCPF(cpf)
{
    const repeatedValues = [
        "00000000000", 
        "11111111111", 
        "22222222222",
        "33333333333",
        "44444444444",
        "55555555555",
        "66666666666",
        "77777777777",
        "88888888888",
        "99999999999"
    ];

    let validCPF = true;

    repeatedValues.forEach((value) => {
        if(value == cpf) {validCPF = false};
    })

    return validCPF;
};

function checkCpfStructure(cpf) 
{
    let multiplier = 10;
    return checkDigitVerifier(cpf, multiplier);
};

function checkDigitVerifier(cpf, multiplier)
{
    if(multiplier >= 12) {
        return true;
    };

    let initialMultiplier = multiplier;
    let sum = 0;
    const withoutDigitsCPF = cpf.substr(0, multiplier - 1).split("");
    const digitVerifier = cpf.charAt(multiplier - 1);

    for(let i = 0; initialMultiplier > 1; initialMultiplier--)
    {
        sum = sum + withoutDigitsCPF[i] * initialMultiplier;
        i++;
    };

    if (digitVerifier != confirmDigit(sum))
    {
        return checkDigitVerifier(cpf, multiplier + 1);  
    };

    if (digitVerifier == confirmDigit(sum))
    {
        return true;  
    };

    return false; 
};

function confirmDigit(sum)
{
    return 11 - (sum % 11);
};

function getCEP(input)
{
    const cep = input.value.replace(/\D/g, "");
    const url = `https://viacep.com.br/ws/${cep}/json/`

    const options = {
        method: "GET",
        mode: "cors",
        headers: {"content-type": "application/json;charset=utf-8"}
    }

    if(!input.validity.patternMismatch && !input.validity.valueMissing)
    {
        fetch(url, options).then(
            (res) => res.json()
        ).then(
            (data) => {
                if(data.erro) {
                    input.setCustomValidity("Não foi possível buscar o CEP");
                    return;
                }
                input.setCustomValidity("");
                fillFieldsWithCepData(data);
                return;
            } 
        );
    };
};

function fillFieldsWithCepData(data)
{
    const logradouro = document.querySelector('[data-type="logradouro"]');
    const city = document.querySelector('[data-type="city"]');
    const state = document.querySelector('[data-type="state"]');

    logradouro.value = data.logradouro;
    city.value = data.localidade;
    state.value = data.uf;
}