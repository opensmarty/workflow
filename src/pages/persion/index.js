import {Persion, Info} from './info';

const persion = new Persion('小明xiaoming', '20');
console.log(persion.say());
document.write(persion.say());
const info = new Info('小明', '10','启蒙小学');
console.log(info.say());
console.log(info.go());
document.write(info.say());
document.write(info.go());