import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-3xl font-bold">プライバシーポリシー</CardTitle>
          <CardDescription className="text-center">
            スキー・スノーボードスクール シフト管理システム
          </CardDescription>
        </CardHeader>
        <CardContent className="prose prose-slate dark:prose-invert max-w-none">
          <div className="space-y-6">
            <section>
              <h2 className="mb-3 text-xl font-semibold">第1条（個人情報）</h2>
              <p>
                「個人情報」とは、個人情報保護法にいう「個人情報」を指すものとし、
                生存する個人に関する情報であって、当該情報に含まれる氏名、生年月日、住所、電話番号、
                連絡先その他の記述等により特定の個人を識別できる情報及び容貌、指紋、声紋にかかるデータ、
                及び健康保険証の保険者番号などの当該情報単体から特定の個人を識別できる情報（個人識別情報）を指します。
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">第2条（個人情報の収集方法）</h2>
              <p>
                運営者は、利用者が利用登録をする際に氏名、メールアドレス、LINEアカウント情報等の個人情報をお尋ねすることがあります。
                また、利用者と提携先などとの間でなされた利用者の個人情報を含む取引記録や決済に関する情報を、
                運営者の提携先（情報提供元、広告主、広告配信先などを含みます。以下、「提携先」といいます。）などから収集することがあります。
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">第3条（個人情報を収集・利用する目的）</h2>
              <p>運営者が個人情報を収集・利用する目的は、以下のとおりです。</p>
              <ol className="mt-3 list-inside list-decimal space-y-2">
                <li>本サービスの提供・運営のため</li>
                <li>利用者からのお問い合わせに回答するため（本人確認を行うことを含む）</li>
                <li>
                  利用者が利用中のサービスの新機能、更新情報、キャンペーン等及び運営者が提供する他のサービスの案内のメールを送付するため
                </li>
                <li>メンテナンス、重要なお知らせなど必要に応じたご連絡のため</li>
                <li>
                  利用規約に違反した利用者や、不正・不当な目的でサービスを利用しようとする利用者の特定をし、ご利用をお断りするため
                </li>
                <li>
                  利用者にご自身の登録情報の閲覧や変更、削除、ご利用状況の閲覧を行っていただくため
                </li>
                <li>シフト管理機能において、勤務スケジュールの管理・調整・通知のため</li>
                <li>上記の利用目的に付随する目的</li>
              </ol>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">第4条（利用目的の変更）</h2>
              <p>
                運営者は、利用目的が変更前と関連性を有すると合理的に認められる場合に限り、
                個人情報の利用目的を変更するものとします。
                利用目的の変更を行った場合には、変更後の目的について、運営者所定の方法により、利用者に通知し、または本ウェブサイト上に公表するものとします。
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">第5条（個人情報の第三者提供）</h2>
              <ol className="list-inside list-decimal space-y-2">
                <li>
                  運営者は、次に掲げる場合を除いて、あらかじめ利用者の同意を得ることなく、第三者に個人情報を提供することはありません。
                  <ul className="ml-4 mt-2 list-inside list-disc space-y-1">
                    <li>法令に基づく場合</li>
                    <li>
                      人の生命、身体または財産の保護のために必要がある場合であって、本人の同意を得ることが困難であるとき
                    </li>
                    <li>
                      公衆衛生の向上または児童の健全な育成の推進のために特に必要がある場合であって、本人の同意を得ることが困難であるとき
                    </li>
                    <li>
                      国の機関もしくは地方公共団体またはその委託を受けた者が法令の定める事務を遂行することに対して協力する必要がある場合であって、本人の同意を得ることにより当該事務の遂行に支障を及ぼすおそれがあるとき
                    </li>
                  </ul>
                </li>
                <li>
                  前項の定めにかかわらず、次に掲げる場合には、当該情報の提供先は第三者に該当しないものとします。
                  <ul className="ml-4 mt-2 list-inside list-disc space-y-1">
                    <li>
                      運営者が利用目的の達成に必要な範囲内において個人情報の取扱いの全部または一部を委託する場合
                    </li>
                    <li>合併その他の事由による事業の承継に伴って個人情報が提供される場合</li>
                  </ul>
                </li>
              </ol>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">第6条（個人情報の開示）</h2>
              <ol className="list-inside list-decimal space-y-2">
                <li>
                  運営者は、本人から個人情報の開示を求められたときは、本人に対し、遅滞なくこれを開示します。
                  ただし、開示することにより次のいずれかに該当する場合は、その全部または一部を開示しないこともあり、
                  開示しない決定をした場合には、その旨を遅滞なく通知します。
                  <ul className="ml-4 mt-2 list-inside list-disc space-y-1">
                    <li>
                      本人または第三者の生命、身体、財産その他の権利利益を害するおそれがある場合
                    </li>
                    <li>運営者の業務の適正な実施に著しい支障を及ぼすおそれがある場合</li>
                    <li>その他法令に違反することとなる場合</li>
                  </ul>
                </li>
                <li>
                  前項の定めにかかわらず、履歴情報および特性情報などの個人情報以外の情報については、原則として開示いたしません。
                </li>
              </ol>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">第7条（個人情報の訂正および削除）</h2>
              <ol className="list-inside list-decimal space-y-2">
                <li>
                  利用者は、運営者の保有する自己の個人情報が誤った情報である場合には、
                  運営者が定める手続きにより、運営者に対して個人情報の訂正、追加または削除（以下、「訂正等」といいます。）を請求することができます。
                </li>
                <li>
                  運営者は、利用者から前項の請求を受けてその請求に応じる必要があると判断した場合には、
                  遅滞なく、当該個人情報の訂正等を行うものとします。
                </li>
                <li>
                  運営者は、前項の規定に基づき訂正等を行った場合、または訂正等を行わない旨の決定をしたときは
                  遅滞なくこれを利用者に通知します。
                </li>
              </ol>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">第8条（個人情報の利用停止等）</h2>
              <ol className="list-inside list-decimal space-y-2">
                <li>
                  運営者は、本人から、個人情報が、利用目的の範囲を超えて取り扱われているという理由、
                  または不正の手段により取得されたものであるという理由により、
                  その利用の停止または消去（以下、「利用停止等」といいます。）を求められた場合には、
                  遅滞なく必要な調査を行います。
                </li>
                <li>
                  前項の調査結果に基づき、その請求に応じる必要があると判断した場合には、
                  遅滞なく、当該個人情報の利用停止等を行います。
                </li>
                <li>
                  運営者は、前項の規定に基づき利用停止等を行った場合、または利用停止等を行わない旨の決定をしたときは、
                  遅滞なくこれを利用者に通知します。
                </li>
              </ol>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">第9条（LINE連携に関する情報の取扱い）</h2>
              <ol className="list-inside list-decimal space-y-2">
                <li>本サービスでは、LINE Platformを利用したログイン機能を提供しています。</li>
                <li>
                  LINE連携により取得する情報は以下のとおりです：
                  <ul className="ml-4 mt-2 list-inside list-disc space-y-1">
                    <li>ユーザー識別子（LINE User ID）</li>
                    <li>表示名（Display Name）</li>
                    <li>プロフィール画像</li>
                  </ul>
                </li>
                <li>
                  これらの情報は、本サービスにおけるユーザー認証、アカウント管理、
                  及びサービス提供のためにのみ使用いたします。
                </li>
                <li>
                  LINEプラットフォームとの連携に関しては、LINEプライバシーポリシーも適用されます。
                </li>
              </ol>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">第10条（プライバシーポリシーの変更）</h2>
              <ol className="list-inside list-decimal space-y-2">
                <li>
                  本ポリシーの内容は、法令その他本ポリシーに別段の定めのある事項を除いて、
                  利用者に通知することなく、変更することができるものとします。
                </li>
                <li>
                  運営者が別途定める場合を除いて、変更後のプライバシーポリシーは、
                  本ウェブサイトに掲載したときから効力を生じるものとします。
                </li>
              </ol>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">第11条（お問い合わせ窓口）</h2>
              <p>
                本ポリシーに関するお問い合わせは、本サービス内のお問い合わせフォーム、
                または運営者が指定する方法にてご連絡ください。
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
