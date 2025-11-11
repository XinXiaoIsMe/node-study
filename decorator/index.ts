import 'reflect-metadata';
import {
    CreatedInfo,
    InstanceLogger,
    NormalizeProp,
    NonEmptyPropValidator
} from './decorator';

type Gender = 'male' | 'female' | 'unknown';

interface UserOptions {
    id: string;
    name: string;
    gender?: Gender;
    age?: number;
    hobbies?: string[];
    createdAt?: Date;
}

interface UserProfile {
    readonly id: string;
    readonly name: string;
    readonly gender: Gender;
    readonly age: number | undefined;
    readonly hobbies: readonly string[];
    readonly createdAt: Date;
}

@CreatedInfo({
    version: '1.0.0',
    creator: 'xx',
    createTime: '2025/11/4'
})
@NonEmptyPropValidator<typeof User>([{
    prop: 'id',
    required: true,
    message: '用户id不能为空'
}])
@InstanceLogger('User created')
class User implements UserProfile {
    private readonly idValue: string;
    private nameValue: string;
    private genderValue: Gender;
    private ageValue: number | undefined;
    private hobbiesValue: readonly string[];
    private readonly createdAtValue: Date;

    constructor (options: UserOptions) {
        const {
            id,
            name,
            age,
            createdAt = new Date(),
            gender = 'unknown',
            hobbies = []
        } = options;

        this.idValue = id;
        this.nameValue = name;
        this.ageValue = age;
        this.hobbiesValue = Object.freeze(User.normalizeHobbies(hobbies));
        this.createdAtValue = createdAt;
        this.genderValue = gender;
    }

    @NormalizeProp
    get id () {
        return this.idValue;
    }

    @NormalizeProp
    get name () {
        return this.nameValue;
    }

    get age () {
        return this.ageValue;
    }

    get gender () {
        return this.genderValue;
    }

    get hobbies () {
        return this.hobbiesValue;
    }

    get createdAt () {
        return this.createdAtValue;
    }

    static normalizeHobbies (hobbies: string[]) {
        return hobbies.map(hobby => hobby.trim()).filter(Boolean);
    }
}

const tony = new User({
    name: '  Tony2   ',
    id: '1'
});
console.log(tony.gender, tony.name.length, Reflect.getMetadata('user:created', User)) // unknown 5 { version: '1.0.0', creator: 'xmg', createTime: '2025/11/4' }

const jerry = new User({
    name: 'Jerry',
    id: ''
}); // 抛出异常，并记录到日志中