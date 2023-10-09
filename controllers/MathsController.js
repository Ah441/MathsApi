import Repository from '../models/repository.js';
import Controller from './Controller.js';

export default class MathsController extends Controller {
    constructor(HttpContext) {
        super(HttpContext);
        this.params = HttpContext.path.params;
    }
    
    get() {
        try {
            if (!this.params || Object.keys(this.params).length === 0) {
                this.InstructionPage();
                return;
            }

            if (!this.params.op) {
                this.HttpContext.response.JSON({
                    error: "(op) manquant."
                });
                return;
            }
    
            const result = this.Requete();
            this.HttpContext.response.JSON(result); 
        } catch (error) {
            this.HttpContext.response.badRequest(error.message);
        }
    }
    
    Requete() {  
        const operation = this.params.op === ' ' ? '+' : this.params.op; 
        const unrecognizedParameters = [];
    
        for (const key of Object.keys(this.params)) {
            if (!["op", "x", "y", "n"].includes(key.toLowerCase())) {
                unrecognizedParameters.push(key);
            }
        }
    
        if (unrecognizedParameters.length > 0) {
            return {
                op: this.params.op || "unknown",
                ...this.params,
                error: `${unrecognizedParameters.join(', ')} parameter(s) n'est pas reconnu`
            };
        }

        switch (operation) {
            case '+':
                return this.addition();
            case '-':
                return this.soustraction();
            case '*':
                return this.multiplication();
            case '/':
                return this.division();
            case '%':
                return this.modulo();
            case '!':
                return this.facteur();
            case 'p':
                return this.premier();
            case 'np':
                return this.nthPrime();
            default:
                throw new Error("operation invalide.");
        }
    }

    addition() {
        const x = parseFloat(this.params.x);
        const y = parseFloat(this.params.y);
    
        if (isNaN(x)) {
            return { op: '+', y: this.params.y, error: "parametre x n'est pas valide" };
        }
        
        if (isNaN(y)) {
            return { op: '+', x: this.params.x, error: "parametre y n'est pas valide" };
        }
    
        return { op: '+', x: this.params.x, y: this.params.y, value: x + y };
    }
    
    

    soustraction() {
        const x = parseFloat(this.params.x);
        const y = parseFloat(this.params.y);
    
        if (isNaN(x)) {
            return { op: '-', y: this.params.y, error: "parametre x n'est pas valide" };
        }
        
        if (isNaN(y)) {
            return { op: '-', x: this.params.x, error: "parametre y n'est pas valide" };
        }
    
        return { op: '-', x: this.params.x, y: this.params.y, value: x - y };
    }
    

    multiplication() {
        const x = parseFloat(this.params.x);
        const y = parseFloat(this.params.y);
    
        if (isNaN(x)) {
            return {
                op: '*',
                x: this.params.x,
                y: this.params.y,
                error: "'x' parameter is not a number"
            };
        }
    
        if (isNaN(y)) {
            return {
                op: '*',
                x: this.params.x,
                y: this.params.y,
                error: "'y' parameter is not a number"
            };
        }
    
        return { op: '*', x: this.params.x, y: this.params.y, value: x * y };
    }
    
    division() {
        const x = parseFloat(this.params.x);
        const y = parseFloat(this.params.y);
        
        if (isNaN(x)) {
            return { op: '/', y: this.params.y, error: "parametre x n'est pas valide" };
        }
        
        if (isNaN(y)) {
            return { op: '/', x: this.params.x, error: "parametre y n'est pas valide" };
        }
    
        if (y === 0) {
            return { op: '/', x: this.params.x, y: this.params.y, value: 'NaN', error: "Division par zero n'est pas permise" };
        }
    
        const result = x / y;
        return { op: '/', x: this.params.x, y: this.params.y, value: result.toString() };
    }

    modulo() {
        const x = parseInt(this.params.x);
        const y = parseInt(this.params.y);
        
        if (isNaN(x)) {
            return { op: '%', y: this.params.y, error: "parametre x n'est pas valide" };
        }
        
        if (isNaN(y)) {
            return { op: '%', x: this.params.x, error: "parametre y n'est pas valide" };
        }
    
        if (y === 0) {
            return { op: '%', x: this.params.x, y: this.params.y, value: "NaN", error: "Modulo par zero n'est pas permise" };
        }
    
        return { op: '%', x: this.params.x, y: this.params.y, value: x % y };
    }

    facteur() {
        const n = parseFloat(this.params.n);
        let error;
    
        if (n === null || isNaN(n)) {
            error = "parametre 'n' manquant ou n'est pas un numero";
        } else if (n % 1 !== 0) {  
            error = "'n' n'est pas un int valide";
        } else if (n <= 0) {  
            error = "'n' doit etre positive > 0";
        }
    
        if (error) {
            return { op: '!', n: this.params.n, value: undefined, error: error };
        }
    
        let value = 1;
        for (let i = 1; i <= n; i++) {
            value *= i;
        }
    
        return { op: '!', n: this.params.n, value: value };
    }
    
    
    
    
    
    premier() {
        const n = parseFloat(this.params.n);
    
        if (n % 1 !== 0 || n <= 0) {
            return { op: 'p', n: this.params.n, value: undefined, error: "Le paramètre 'n' n'est pas un entier positif supérieur a 0." };
        }
    
        let premier = n > 1;
        for (let i = 2; i * i <= n && premier; i++) {
            if (n % i === 0) {
                premier = false;
            }
        }
    
        return { op: 'p', n: this.params.n, value: premier };
    }
    
    nthPrime() {
        const n = parseInt(this.params.n);
        if (isNaN(n) || n < 1) {
            return { op: 'np', n: this.params.n, value: undefined, error: "Le paramètre 'n' n'est pas un entier positif." };
        }
    
        let compteur = 0;
        let num = 1;
        while (compteur < n) {
            num++;
            if (this.estPremier(num)) {
                compteur++;
            }
        }
    
        return { op: 'np', n: this.params.n, value: num };
    }
    
    
    estPremier(value) {
        for (let i = 2; i * i <= value; i++) {
            if (value % i === 0) {
                return false;
            }
        }
        return value > 1;
    }
    
InstructionPage() {
    const instructions = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Maths Endpoint Instructions</title>
    </head>
    <body>
        <h1>GET : Maths endpoint</h1>
        <h1>List of possible query strings:</h1>
        
    ?op=+&x=number&y=number<br>
    return {"op":"+", "x":number, "y":number, "value": x + y}<br><br>
    ?op=-&x=number&y=number<br>
    return {"op":"-", "x":number, "y": number, "value": x - y}<br><br>
    ?op=*&x=number&y=number<br>
    return {"op":"*", "x":number, "y":number, "value": x * y}<br><br>
    ?op=/&x=number&y=number<br>
    return {"op":"/", "x":number, "y":number, "value": x / y}<br><br>
    ?op=%&x=number&y=number<br>
    return {"op":"%", "x":number, "y":number, "value": x % y}<br><br>
    ?op=!&n=integer<br>
    return {"op":"!", "n":integer, "value": factorial of n}<br><br>
    ?op=p&n=integer<br>
    return {"op": "p","n": integer, "value": true if n is a prime number}<br><br>
    ?op=np&n=integer<br>
    return {"op":"np", "n":integer, "value": nth prime number}<br><br> 
    
    </body>
    </html>
    `;
    

    this.HttpContext.response.content('text/html', instructions);

    }
}
