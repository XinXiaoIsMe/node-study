# DTO (Data Transfer Object)
数据传输对象，用于在http层进行数据传输，应用在controller层，业务比较简单时也可用在service层，但不能用在repository层。通常使用class定义，配合class-validator等库进行参数校验。

例如：
```ts
import { IsString } from 'class-validator';

// 请求DTO
@injectable()
class LoginDto {
  @IsString()
  username!: string;

  @IsString()
  password!: string;
}

// 响应DTO
class LoginResponseDto {
  id: string;
  username: string;
  role: Role;
  token: string;
}
```
controller层使用:
```ts
@Controller('/')
class LoginController implements ILoginController {
  @ApplyMiddleware(AUTH_MIDDLEWARES.LoginValidator)
  @Post('/login')
  login(@Body() data: LoginDto) {}
}
```
# Model
后端内部的数据传递规范，例如从service层到repository层，或者从repository到service层，通常使用interface
```ts
// 从repository返回给service的数据类型
export interface UserProfileModel {
  username: string;
  age: number;
  hobbies: string[];
}
```

> 大部分nodejs项目使用DTO和Model即可

# VO（View Object）
视图对象。通常用于一些稳定的视图需要的数据格式。例如用户信息展示。可以简单理解为只读的Model。VO在以下场景可能会用到：
1. 部分稳定的视图数据
2. 多个来源聚合之后的数据，例如查询商品信息时，可能从product（里面包含商品的名称等）和price（包含原价、打折价等）两张表查询数据后聚合

```ts
interface ProductVo {
  name: string;
  price: number;
}
```

# BO(Business Object)
业务对象。包含一系列业务操作的类。通常在业务很复杂的时候，无法将所有逻辑写在service层，此时可以抽象出BO。

```ts
export class OrderCreateBO {
  constructor(
    private readonly user: User,
    private readonly items: OrderItem[]
  ) {}

  calculateTotalPrice() { ... }
  checkInventory() { ... }
  canSubmit() { ... }
}
```
