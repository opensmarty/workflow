class Persion{
    constructor(name, age){
        this.name = name;
        this.age = age;
    }

    say(){
        return '你好！我叫'+ this.name + ', 今年' + this.age + '岁.';
    }
}

export default Persion;