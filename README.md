# 说明

Unreal初始项目

## 使用场景

* 快速创建用于原型功能验证的Unreal项目

## 特性

* 资源基于Unreal官方资源，但做了裁剪，只保留了第三人称视角测试地图需要的资源
* 包含一个EditorHelper插件，提供一些便利于编辑器的功能，具体[参考](Plugins/EditorHelper/README.md)

## 使用方法

* 克隆项目到本地
* 执行`gen.py <ProjectName>`生成项目，会自动将关联的文件和文件中的`ProjectName`替换为指定的项目名
