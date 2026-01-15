{
  "targets": [
    {
      "target_name": "cpu",
      "sources": ["index.cpp"],
      "cflags_cc!": [
        "-fno-exceptions"
      ],
      "cflags_cc": [
        "-std=c++17",
        "-fexceptions"
      ],
      "msvs_settings": {
        "VCCLCompilerTool": {
          "ExceptionHandling": 1,
          "AdditionalOptions": ["/std:c++17"]
        }
      },
      "include_dirs": [
        "<!@(node -p \"require('node-addon-api').include\")"
      ],
      "conditions": [
        [
          "OS==\"mac\" or OS==\"ios\"",
          {
            "libraries": [
              "-framework",
              "ApplicationServices"
            ]
          }
        ],
        [
          "OS==\"win\"",
          {
            "libraries": [
              "user32.lib"
            ]
          }
        ]
      ]
    }
  ]
}
