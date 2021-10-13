<!--
 * @Descripttion: 
 * @version: 
 * @Author: 鹿角兔子
 * @Date: 2021-10-02 00:26:36
 * @LastEditors: 鹿角兔子
 * @LastEditTime: 2021-10-14 00:11:00
-->
## 什么是 ***[this]()*** ?

[ECMAScript]() 中定义了 ***this*** 是从抽象操作(简称 AO) [ResolveThisBinding]() 获取：
>  [ResolveThisBinding]() 使用[当前执行上下文]()的 *LexicalEnvironment* 来返回 ***this*** 的绑定，当 [ResolveThisBinding]() 被调用时执行以下步骤:  
> 
> 1. Let envRec be [GetThisEnvironment]()().
>  2.  Return ? envRec.GetThisBinding().

[GetThisEnvironment]() 的行为简单来说就是判断 [当前执行上下文]() 的 *LexicalEnvironment* 的 [HasThisBinding]() 方法是否返回true，也就是判断当前 *LexicalEnvironment* 是否可以执行绑定 ***this*** 操作，如果可以则返回当前 *LexicalEnvironment* 作为 ***this*** 的绑定值，如果不可以则判断上一层 [Environment Record]() (也就是 [[[OuterEnv]]]() )直到满足条件。

需要注意的是，[Environment Record]() 有5种子类，其中只有 [Global Environment Records](),[modules environment Record](),[function Environment Records]() 的 [HasThisBinding]() 抽象方法会返回true以及各自实现了 [GetThisBinding]() 抽象方法；也就是说 ***this*** 绑定只会发生在这三种 [Environment Record]() 中 。

GetThisBinding 的返回值指向的是 [当前执行上下文]() 中 ***this*** 的值，因此 ***this*** 的值会随诊 [当前执行上下文]() 变化而变化。


## 1. Global execution context

```javascript
console.log(this); // window
setTimeout(function() {
    console.log(this); // window
    console.log("Not global context");
})
```
[Global Environment Records]() 的 [GetThisBinding]() 的实现中,
> Return envRec.[[GlobalThisValue]]

[[[GlobalThisValue]]]() 可以通过 [globalThis]() ( [globalThis]() 在web端是 *window* ,在 nodeJs 中则是 *global* ) 来访问。

## 2. modules environment Record
这里的 [modules environment Record]() 主要指的是 ***\<script type="module"\>*** 中的全局执行上下文， [modules environment Record]() 的 [GetThisBinding]() 实现如下:  
> Return undefined

也就是说在module环境中，全局执行上下文的 ***this*** 永远是 *undefined*，因为module默认是 [严格模式]()

## 3. eval code
***eval*** 分为直接和间接调用两种情况，
 - 直接调用 ***eval*** 的一般看起来是
   - eval(...);
   - (eval)(...);
   - ((eval))(...); 
 - 间接调用 ***eval*** 指的是通过调用 ***eval*** 的引用来调用 ***eval***,一般是
   - eval?.(...)
   - (..., eval)(...)
   - window.eval(...)
   - eval.call(..., ...)
   - ```javascript
        const aliasEval1 = eval;
        window.aliasEval2 = eval;
        aliasEval1(...);
        aliasEval2(...);
        ```
   - ```javascript
        const originalEval = eval;
        widnow.eval = (x) => originalEval(x);
        eval(...);
        ```
    [这一篇文章](https://web.archive.org/web/20210530120958/https://dmitrysoshnikov.com/ecmascript/es5-chapter-2-strict-mode#indirect-eval-call)较为详细地讨论了 ***eval*** 直接与间接调用的区别。

    [PerformEval]() 展示了 ***eval*** 代码执行的步骤，其中15、16条说明了
    > 1. Let lexEnv be NewDeclarativeEnvironment(runningContext's LexicalEnvironment).  
    如果是直接调用，则取执行 ***eval*** 的上下文的 LexicalEnvironment 作 declarative Environment Record
    > 2. Let lexEnv be NewDeclarativeEnvironment(evalRealm.[[GlobalEnv]]).  
    > 如果是间接调用，则取 Global Environment Records 作 declarative Environment Record

    也就是说
    > 1. 直接调用， ***this*** 取之于执行 ***eval*** 的执行上下文
    > 2. 间接调用，***this*** 取之于 globalThis

## 4. function Environment Record
函数调用分为两类AO， [EvaluateCall]()、[EvaluateNew]() 分别对应四种函数调用的语法：  

- [EvaluateCall]():
  - [Normal function calls]()
  - [Optional chaining calls]()
  - [Tagged templatesd]()
- [EvaluateNew]():
  - [Constructor invocations]()


以上四种函数调用在最后都会调用 AO [Call]()，而 [Call]() 在最后也会调用函数的内部方法 [[[Call]]]()，[[[Call]]]() 就是执行函数的实际行为。在 [[[Call]]]() 中会调用 [PrepareForOrdinaryCall]() 来为函数调用新建*函数环境记录* [NewFunctionEnvironment]()，随后 [[[Call]]]()会调用 [[[OrdinaryCallBindThis]]]() 来决定 [[[ThisValue]]]()，这里面主要看第2、5、6条
>2. If thisMode is lexical, return NormalCompletion(undefined).  
>     - 如果 thisMode 是 lexcial，不执行后续的AO [BindThisValue]()
>     - 对应了箭头函数没有 ***this*** 的现象

>5. If thisMode is strict, let thisValue be thisArgument.
>     - 如果 thisMode 是 strice，[[[ThisValue]]]() 只取 thisArgument
>     - 对应了在严格模式下，语法上函数调用不取对象时 ***this*** 为 null 的现象

> 6. Else,  
>     1. If thisArgument is undefined or null, then  
>         1. Let globalEnv be calleeRealm.[[GlobalEnv]].
>         2. Assert: globalEnv is a global Environment Record.
>         3. iii. Let thisValue be globalEnv.[[GlobalThisValue]].
>     2. Else,
>         1. Let thisValue be ! ToObject(thisArgument).  

只有在 [[[ThisMode]]]() 是 *strict* 或者 *global* 的情况下，才会执行 [BindThisValue]()，将 [[[ThisValue]]]() 绑定到*函数环境记录*.

之后便通过 [GetThisBinding]() 来获取当前 [当前执行上下文]() 的 ***this***.

以上便是一个粗略的总览，下文会提出数个常见的详细例子。

## [Arrow functions]()
在[箭头函数]()的[实例化]()中，会将函数实例的 [[[ThisMode]]]() 设置为 ***lexcial-this***

#### InstantiateArrowFunctionExpression
> 5. Let closure be **OrdinaryFunctionCreate**(%Function.prototype%, sourceText, ArrowParameters, ConciseBody, ***lexical-this***, scope, privateScope).


#### [OrdinaryFunctionCreate]()
> 9. If thisMode is ***lexical-this***, set F.[[ThisMode]] to lexical.
> 10. Else if Strict is true, set F.[[ThisMode]] to strict.
> 11. Else, set F.[[ThisMode]] to global.

上文也提到 [[[OrdinaryCallBindThis]]]() 对于 [[[ThisMode]]]() 是 ***lexcial*** 的值会直接跳过绑定 ***this*** 环节，因此[箭头函数]()对应的[执行上下文]()是没有自己的 ***this***.

[执行上下文]()通过 [ResolveThisBinding]() 和 [GetThisEnvironment]() 来获取 ***this***，

#### [GetThisEnvironemnt]()
> 2. Repeat,
>     1. Let exists be env.HasThisBinding().
>     2. If exists is true, return env.
>     3. Let outer be env.[[OuterEnv]].
>     4. Assert: outer is not null.
>     5. Set env to outer.

通过调用 [HasThisBinding]() 来判断当前环境是否有 ***this***，如果没有则查看 [[[OuterEnv]]]() 直到找到可用 ***this***.

也就是说，判断[箭头函数]()中的 ***this*** 指向的是哪个对象只看箭头函数在哪个函数执行，[箭头函数]()的 ***this*** 指向与外部函数一致。


## Function properties
  ```javascript
  const refObj = {
    func: function() {
      console.log(this)
    }
  }
  ```
  以上对象为例子，以下几种不同调用语法的输出都是 *refObj*
  - ***refObj.func()***
  - ***refObj\["func"]()***
  - ***refObj?.func()***
  - ***refObj.func?.()***
  - ***refObj.func``***
  
  以最常见的 ***refObj.func()*** 和 ***refObj\["func"\]()*** 为例 ，两者都是语法格式 [CallMemberExpression]() 的具体实例，***refObj.func*** (或者 ***refObj\["func"]***) 是 [MemberExpression]()，***()*** 是 [Arguments]().在解释语义时，会从 [MemberExpression]() 中寻找 [[[Base]]]() 作为 ***this*** 的值.

  ### [Runtime Semantics: Evaluation]()
> .  
> .  
> .  
> 2. Let ***memberExpr*** be the MemberExpression of expr.  
> .  
> 4. Let ***ref*** be the result of evaluating ***memberExpr***.
> .  
> .  
> .  
> 9. Return ? [EvaluateCall]()(func, ***ref***, arguments, tailCall).

  ### [EvaluateCall]()
> 1. If ***ref*** is a Reference Record, then
>     1. If [IsPropertyReference]()(***ref***) is true, then
>         1. Let thisValue be [GetThisValue]()(***ref***).
>     2. Else,
>         1. Let refEnv be ***ref***.[[Base]].
>         2. Assert: refEnv is an Environment Record.
>         3. Let thisValue be refEnv.WithBaseObject().  
> 2. Else,
>     1. Let thisValue be undefined.
.  
.  
.  
> 7. Let result be [Call]()(func, ***thisValue***, argList).

结合来看，[EvaluateCall]() 用 [IsPropertyReference]() 判断 [MemberExpression]() （或者说是 ***refObj.func***）是否是某个对象的属性，如果是则 [GetThisValue]() 返回它的 [[[Base]]]() 作为 ***this***.

剩下的 [Optional-chains]() 和 [Tagged Templates]() 都会将 [MemberExpression]() 作为参数传递给 [EvaluateCall]().


## Calls without base reference, strice mode, and with
不带 *base* 的函数调用一般是函数没有作为对象属性时被调用，举个例子:
```javascript
function a() {
  console.log(this);
}
a(); // window
```
虽然 *a* 输出 *window* 而且也是 *window* 的属性，但是这也算是 ***Calls without base*** 的范围内，这里主要强调的是语法上的差异，如果是 ***window.a()*** 则算是带 *base* ，***Calls without base*** 也常发生在变量传递中，例如：
```javascript
const g = (f) => f();
cosnt h = refObj.func;

g(refObj.func);
h();
(0, refObj.func)(); // 返回refObj的func方法后调用
```
上文的 [EvaluateCall]() 中提到 [IsPropertyReference]() 判断 ***Calls without base*** 语法调用的 [[[Base]]]() 都是 [Global Environment Records]() 因此返回false，进入Else判断：
> Else,
> 1. Let refEnv be ref.[[Base]].
> 2. Assert: refEnv is an Environment Record.
> 3. Let thisValue be refEnv.WithBaseObject().

因此 ***this*** 的值来自于环境记录的 [WithBaseObject]()，此方法一般都会返回undefined，除非使用了 [with]() 声明块指定了对象。这种方式的调用会导致传递给 [Call]() 的 *thisValue* 为空，而 [OrdinaryCallBindThis]() 在 ***严格模式*** 下只会将 ***this*** 指向 *thisValue* 而不是 ***非严格模式*** 的 *thisValue* || [[[GlobalThisValue]]]()。


## .call, .apply, .bind
[.call]() 和 [.apply]() 都是直接将参数的 ***this*** 传递给 [Call]()，后续的步骤和普通调用函数并没有什么不同。

[.bind]() 则会通过 [BoundFunctionCreate]() 创建一个新的函数，新函数有自己单独实现的 [[[Call]]]() 和 [[BoundThis]]() 用于存储参数 ***this***

需要注意的是，在 [OrdinaryCallBindThis]() 中的第6.b中就把 ***this*** 转化成对象，也就是说如果在调用 [.call]() 时传入非对象的String、Number等数据，都会被转化成对象格式，例如：
```javascript
function fnc() {
  console.log(this);
}
var s = new String("s");
fnc.call(s); // String {"s"}
fnc.call("a"); // String {"a"}
```

## Constructors，classes and new

***new*** 语法创建对象执行 [EvaluateNew]() 并将构造函数和参数传递给 [Construct]() 并最终调用内部方法 [[[Construct]]](). 
[[[Construct]]]() ， 如果构造函数是一个 ***base*** 类型的函数(非 class extends) 调用 [OrdinaryCreateFromConstructor]() 生成继承构造函数 ***prototype*** 的对象，并将该对象用作 [OrdinaryCallBindThis]() 的 ***this*** 参数绑定到该执行上下文，之后执行函数内容并返回对象。
需要注意的是，在 ***class*** 中定义的方法都是严格模式,

```javascript
class A{
  m1(){
    return this;
  }
  m2(){
    const m1 = this.m1;
    
    console.log(m1());
  }
}

new A().m2(); // without base 调用且[[OuterEnv]]是global, 因此严格模式下是undefined
```

## super
上面提到了 ***base*** 类型的构造函数，相反的则是 ***derived*** 类型，主要是通过 [extends]() 继承父类的子类，子类在执行 ***new*** 语法时和 ***base***类 不同的是不会第一次 [Construct]() 生成对象作为 ***this*** 绑定在执行上下文，而是要通过 [super]() 时再次执行 [Construct]() 来执行 ***base*** 父类的构造函数，并将返回的对象作为 ***this*** 绑定在当前执行环境，所以子类里在调用 [super] 前都无法使用 ***this***.
```javascript
class Super {
  constructor(a) {
    this.a = a; 
  }
}
class Sub extends Super {
  constructor(a, b) {
    // this.b = b; 
    super(a);
    this.b = b;
  }
}

const instance = new Sub(1, 2);
console.log(instance); // Sub {a: 1, b: 2}
```

## 5. Evaluating class fields
[static]() 字段允许在类声明体内定义只能由 ***class*** 本身调用的变量，[static]() 声明的变量都会在 [ClassDefinitionEvaluation]() 被收集进待处理静态元素队列，并在最后绑定在 ***class*** 本身上.
> 31. For each element elementRecord of staticElements, do
>     1. If elementRecord is a ClassFieldDefinition Record, then
>         1. Let result be DefineField(F, elementRecord).  
> ....

非 ***static*** 的声明则存入 [[[Fields]]]() 中，等待之后执行 [[[Construct]]]() 取出来绑定在新建对象上。

因此可以得知，***static*** 声明中的 ***this*** 都是直接指向 ***class***，而非 ***static*** 的 ***this*** 则是被当作构造函数的内容而指向新建对象。

```javascript
class Demo{
  a = this;
  b() {
    return this;
  }
  static c= this;
  static d() {
    return this;
  }
}

const demo = new Demo();
console.log(demo.a, demo.b()); // demo demo
console.log(Demo.c, Demo.d()); // Demo Demo
```