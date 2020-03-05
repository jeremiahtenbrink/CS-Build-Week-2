
exports.up = function(knex) {
  return knex.schema.createTable('rooms', (tbl) => {
    tbl.integer('room_id');
    tbl.string('title');
    tbl.string('terrain');
    tbl.string('elevation');
    tbl.string('description');
    tbl.string('coordinates');
    tbl.string('items');
    tbl.string('exits');
    tbl.string('messages');
  })
};

exports.down = function(knex) {
  
};
