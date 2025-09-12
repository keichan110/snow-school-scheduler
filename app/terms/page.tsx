import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-3xl font-bold">利用規約</CardTitle>
          <CardDescription className="text-center">
            スキー・スノーボードスクール シフト管理システム
          </CardDescription>
        </CardHeader>
        <CardContent className="prose prose-slate dark:prose-invert max-w-none">
          <div className="space-y-6">
            <section>
              <h2 className="mb-3 text-xl font-semibold">第1条（適用）</h2>
              <p>
                本利用規約（以下「本規約」といいます。）は、スキー・スノーボードスクール
                シフト管理システム（以下「本サービス」といいます。）の利用に関して、
                本サービスの運営者（以下「運営者」といいます。）と利用者との間の権利義務関係を定めることを目的とし、
                利用者と運営者との間のすべての関係に適用されるものとします。
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">第2条（利用登録）</h2>
              <ol className="list-inside list-decimal space-y-2">
                <li>
                  利用者は、招待による新規登録を行うことで本サービスを利用することができます。
                </li>
                <li>
                  利用登録は、利用者がLINEアカウントを使用して認証を行い、
                  運営者がこれを承認することで完了するものとします。
                </li>
                <li>利用者は、利用登録時に正確かつ最新の情報を提供するものとします。</li>
              </ol>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">第3条（利用者の責務）</h2>
              <ol className="list-inside list-decimal space-y-2">
                <li>
                  利用者は、自己の責任において本サービスを利用するものとし、
                  本サービスにおいて行った一切の行為およびその結果について責任を負うものとします。
                </li>
                <li>
                  利用者は、本サービスの利用に際し、以下の行為をしてはならないものとします。
                  <ul className="ml-4 mt-2 list-inside list-disc space-y-1">
                    <li>法令または公序良俗に違反する行為</li>
                    <li>犯罪行為に関連する行為</li>
                    <li>他の利用者または第三者の権利を侵害する行為</li>
                    <li>本サービスの運営を妨害するおそれのある行為</li>
                    <li>不正アクセスまたはこれに類する行為</li>
                  </ul>
                </li>
              </ol>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">第4条（個人情報の取扱い）</h2>
              <p>
                本サービスの利用によって取得する個人情報については、
                運営者が別途定めるプライバシーポリシーに従って適切に取り扱うものとします。
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">第5条（サービス内容の変更等）</h2>
              <p>
                運営者は、利用者への事前の告知をもって、本サービスの内容を変更、
                追加または廃止することがあり、利用者はこれに同意するものとします。
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">第6条（利用制限および登録抹消）</h2>
              <ol className="list-inside list-decimal space-y-2">
                <li>
                  運営者は、利用者が以下のいずれかに該当する場合には、
                  事前の通知なく利用者に対して本サービスの全部もしくは一部の利用を制限し、
                  または利用者としての登録を抹消することができるものとします。
                  <ul className="ml-4 mt-2 list-inside list-disc space-y-1">
                    <li>本規約のいずれかの条項に違反した場合</li>
                    <li>登録事項に虚偽の事実があることが判明した場合</li>
                    <li>本サービスの運営に支障をきたすと運営者が判断した場合</li>
                  </ul>
                </li>
                <li>
                  前項各号のいずれかに該当した場合、利用者は当然に運営者に対する一切の債務について期限の利益を失い、
                  その時点において負担する一切の債務を直ちに一括して弁済しなければなりません。
                </li>
              </ol>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">第7条（免責事項）</h2>
              <ol className="list-inside list-decimal space-y-2">
                <li>
                  運営者は、本サービスに事実上または法律上の瑕疵（安全性、信頼性、正確性、完全性、有効性、
                  特定の目的への適合性、セキュリティなどに関する欠陥、エラーやバグ、権利侵害などを含みます。）が
                  ないことを明示的にも黙示的にも保証しておりません。
                </li>
                <li>
                  運営者は、本サービスに起因して利用者に生じたあらゆる損害について一切の責任を負いません。
                </li>
              </ol>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">第8条（サービス利用の停止等）</h2>
              <p>
                運営者は、以下のいずれかの事由があると判断した場合、利用者に事前に通知することなく
                本サービスの全部または一部の提供を停止または中断することができるものとします。
              </p>
              <ul className="ml-4 mt-2 list-inside list-disc space-y-1">
                <li>本サービスにかかるコンピュータシステムの保守点検または更新を行う場合</li>
                <li>
                  地震、落雷、火災、停電または天災などの不可抗力により、本サービスの提供が困難となった場合
                </li>
                <li>コンピュータまたは通信回線等が事故により停止した場合</li>
                <li>その他、運営者が本サービスの提供が困難と判断した場合</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">第9条（本規約の変更）</h2>
              <p>
                運営者は、本規約を変更する場合があります。本規約の変更は、
                変更後の本規約を本サービス上に表示した時点で効力を生じるものとします。
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">第10条（準拠法・裁判管轄）</h2>
              <p>
                本規約の解釈にあたっては、日本法を準拠法とします。
                本サービスに関して紛争が生じた場合には、運営者の本店所在地を管轄する裁判所を
                専属的合意管轄とします。
              </p>
            </section>

            <footer className="mt-8 border-t border-border pt-8">
              <p className="text-center text-sm text-muted-foreground">
                制定日: 2024年1月1日
                <br />
                最終更新日: 2024年1月1日
              </p>
            </footer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
