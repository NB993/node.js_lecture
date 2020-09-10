var args = process.argv;
console.log(args);
// [
//   'C:\\Program Files\\nodejs\\node.exe', //node.js가 설치된 위치
//   'C:\\Users\\admin\\dev\\web2-node.js\\syntax\\conditional.js', //실행된 이 파일의 경로
//   'egoing' //입력한 입력값을 리턴
// ]

if(args[2] === "1") { //node js에서는 프로그램 입력값이 배열 2번째부터 리턴된다.
    console.log("C1");
} else {
    console.log("C2");
}