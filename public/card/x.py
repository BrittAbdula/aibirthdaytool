import os
import re

def rename_svg_files(directory):
    # 确保目录路径以斜杠结尾
    if not directory.endswith('/'):
        directory += '/'
    print(directory)

    # 获取目录中所有的 SVG 文件
    svg_files = [f for f in os.listdir(directory) if f.endswith('.svg')]

    # 对文件名进行自然排序
    svg_files.sort(key=lambda f: int(re.sub('\D', '', f) or 0))

    # 重命名文件
    for index, filename in enumerate(svg_files, start=1):
        old_path = os.path.join(directory, filename)
        new_filename = f"{index}.svg"
        new_path = os.path.join(directory, new_filename)
        
        os.rename(old_path, new_path)
        print(f"重命名: {filename} -> {new_filename}")

    print(f"总共重命名了 {len(svg_files)} 个文件。")


# 使用脚本
card_directory = "C:\\Users\\MD\\greetly.ai\\public\\card"  # 请替换为实际的 card 目录路径
rename_svg_files(card_directory)