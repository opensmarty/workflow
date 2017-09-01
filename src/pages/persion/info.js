class Persion{
    constructor(name, age){
        this.name = name;
        this.age = age;
    }

    say(){
        return '你好！我叫'+ this.name + ', 今年' + this.age + '岁.';
    }
}

class Info extends Persion{
    constructor(name, age, school) {
        super(name, age);
        this.name = name;
        this.school = school;
    }

    go() {
        return '你好！我叫'+ this.name + ', 今年上' + this.school + '岁.';
    }
}

export {Persion, Info};