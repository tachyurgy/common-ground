class CreateAgreements < ActiveRecord::Migration[8.1]
  def change
    create_table :agreements do |t|
      t.string :title
      t.text :description
      t.string :status
      t.text :participant_names

      t.timestamps
    end
  end
end
