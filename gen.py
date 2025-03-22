"""
gen.py [ProjectName]`生成项目，会自动将关联的文件和文件中的`ProjectName`替换为指定的项目名
算法：

* 处理的文件范围: Starter.uproject和 Source 目录下的所有文件
* 先将所有文件中的"Starter"替换为指定的项目名，注意：如果源字符串有大小写，替换的时候也要保持大小写
* 再将所有文件名中的"Starter"替换为指定的项目名
* 最后将Source目录下的Starter和StarterEditor目录重命名为指定的项目名和指定的项目名+Editor
"""

#!/usr/bin/env python3
import os
import sys
import re

def case_preserve_replace(match, new_word):
    """
    根据匹配的文本格式返回对应大小写的新单词：
    - 如果匹配文本全大写，则返回 new_word.upper()
    - 如果全小写，则返回 new_word.lower()
    - 否则返回原始 new_word
    """
    text = match.group(0)
    if text.isupper():
        return new_word.upper()
    elif text.islower():
        return new_word.lower()
    else:
        return new_word

def process_file(file_path, project_name, pattern):
    """读取文件内容，替换其中所有出现的 'Starter' 并写回文件"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"跳过文件 {file_path}（读取错误: {e}）")
        return

    new_content = pattern.sub(lambda m: case_preserve_replace(m, project_name), content)
    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"已处理文件内容：{file_path}")

def process_files_in_directory(directory, project_name, pattern):
    """递归处理指定目录下所有文件的内容替换"""
    for root, _, files in os.walk(directory):
        for file in files:
            file_path = os.path.join(root, file)
            process_file(file_path, project_name, pattern)

def rename_file(file_path, project_name, pattern):
    """重命名文件名，只处理文件名，不处理文件夹"""
    # 获取文件名和目录部分
    dir_path, filename = os.path.split(file_path)
    
    # 只替换文件名部分，保留目录路径不变
    new_filename = pattern.sub(lambda m: case_preserve_replace(m, project_name), filename)
    
    # 如果文件名有变化且确实是文件(非目录)，才进行重命名
    if new_filename != filename and os.path.isfile(file_path):
        new_file_path = os.path.join(dir_path, new_filename)
        os.rename(file_path, new_file_path)
        print(f"已重命名文件：{file_path} -> {new_file_path}")

def rename_files_in_directory(directory, project_name, pattern):
    """递归处理指定目录下所有文件名的替换"""
    for root, _, files in os.walk(directory):
        for file in files:
            file_path = os.path.join(root, file)
            rename_file(file_path, project_name, pattern)

def main():
    if len(sys.argv) < 2:
        print("用法：gen.py [ProjectName]")
        sys.exit(1)

    project_name = sys.argv[1]
    pattern = re.compile(r"Starter", re.IGNORECASE)

    # 处理 Starter.uproject 文件
    uproject_file = "Starter.uproject"
    if os.path.exists(uproject_file):
        process_file(uproject_file, project_name, pattern)
    else:
        print(f"{uproject_file} 文件不存在。")

    # 处理 Source 目录下所有文件内容
    source_dir = "Source"
    if os.path.exists(source_dir):
        process_files_in_directory(source_dir, project_name, pattern)
    else:
        print(f"{source_dir} 目录不存在。")

    # 重命名 Starter.uproject 文件
    rename_file(uproject_file, project_name, pattern)

    # 重命名 Source 目录下所有文件名
    if os.path.exists(source_dir):
        rename_files_in_directory(source_dir, project_name, pattern)
    else:
        print(f"{source_dir} 目录不存在，无法重命名文件。")

    # 重命名 Source 目录下的目录：Starter -> [ProjectName]，StarterEditor -> [ProjectName]Editor
    starter_dir = os.path.join(source_dir, "Starter")
    starter_editor_dir = os.path.join(source_dir, "StarterEditor")
    new_starter_dir = os.path.join(source_dir, project_name)
    new_starter_editor_dir = os.path.join(source_dir, project_name + "Editor")

    if os.path.exists(starter_dir):
        os.rename(starter_dir, new_starter_dir)
        print(f"已重命名目录：{starter_dir} -> {new_starter_dir}")
    else:
        print(f"{starter_dir} 目录不存在。")

    if os.path.exists(starter_editor_dir):
        os.rename(starter_editor_dir, new_starter_editor_dir)
        print(f"已重命名目录：{starter_editor_dir} -> {new_starter_editor_dir}")
    else:
        print(f"{starter_editor_dir} 目录不存在。")

if __name__ == "__main__":
    main()
