
#define NAPI_VERSION 3  // 指定addon版本
#define NODE_ADDON_API_DISABLE_CPP_EXCEPTIONS
#include <napi.h>  // addon API

#if defined(_WIN32)
#  include <windows.h> // Windows API
#elif defined(__APPLE__)
#  include <ApplicationServices/ApplicationServices.h>
#endif

Napi::Value GetScreenSize(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env(); // 指定环境

#if defined(_WIN32)
    int cx = GetSystemMetrics(SM_CXSCREEN); // 获取设备宽
    int cy = GetSystemMetrics(SM_CYSCREEN); // 获取设备高
#elif defined(__APPLE__)
    const CGRect bounds = CGDisplayBounds(CGMainDisplayID());
    const int cx = static_cast<int>(CGRectGetWidth(bounds));
    const int cy = static_cast<int>(CGRectGetHeight(bounds));
#else
    Napi::Error::New(env, "getScreenSize is not implemented on this platform")
        .ThrowAsJavaScriptException();
    return env.Null();
#endif

    Napi::Object result = Napi::Object::New(env); // 创建一个对象
    result.Set("width", cx);
    result.Set("height", cy);

    return result; // 返回对象
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
    // 抛出一个函数  getScreenSize
    exports.Set("getScreenSize", Napi::Function::New(env, GetScreenSize));
    return exports;
}
// addon固定语法 必须抛出这个方法
NODE_API_MODULE(NODE_GYP_MODULE_NAME, Init)
