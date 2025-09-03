# app.py
from PyInquirer import prompt, Separator  # pyright: ignore[reportMissingImports]

questions = [
    {
        'type': 'input',
        'name': 'name',
        'message': '당신의 이름은 무엇인가요?'
    },
    {
        'type': 'list',
        'name': 'language',
        'message': '가장 좋아하는 프로그래밍 언어는?',
        'choices': [
            'Python',
            'JavaScript',
            'Java',
            'C++'
        ]
    }
]

answers = prompt(questions)

if answers:
    print(f"\n안녕하세요, {answers.get('name')}님!")
    print(f"가장 좋아하는 언어는 {answers.get('language')}이군요!")
else:
    print("\n입력이 취소되었습니다.")