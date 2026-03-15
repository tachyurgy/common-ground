class CreateAgreementVersions < ActiveRecord::Migration[8.1]
  def change
    create_table :agreement_versions do |t|
      t.references :agreement, null: false, foreign_key: true
      t.integer :version_number
      t.text :content
      t.text :change_summary

      t.timestamps
    end
  end
end
