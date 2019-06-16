const WizardScene = require('telegraf/scenes/wizard')
const Markup = require('telegraf/markup')
const Extra = require('telegraf/extra') 
const data = require('./data')

const superWizard = new WizardScene('super-wizard',

  ({ wizard, i18n, replyWithHTML }) => {
    replyWithHTML(
      i18n.t('getName'),
      Extra
        .markup(Markup.removeKeyboard(true))
    )
    return wizard.next()
  },

  ({ wizard, session, scene, message, chat, i18n, replyWithHTML }) => {
    if (message.text == '/start') {
      return scene.enter('super-wizard')
    }

    if (+chat.id < 0) {
      return
    }

    if (!message.text) {
      return replyWithHTML(i18n.t('getName'))
    }

    replyWithHTML(
      i18n.t('getNumber'),
      Extra
        .markup(Markup.keyboard([
          [Markup.contactRequestButton(i18n.t('buttons.sendNumber'))]
        ]).resize().oneTime())
    )

    session.name = message.text
    return wizard.next()
  },

  ({ wizard, session, scene, message, i18n, replyWithHTML }) => {
    if (message.text == '/start') {
      return scene.enter('super-wizard')
    }

    if (!message.text && !message.contact) {
      return replyWithHTML(i18n.t('getNumber'))
    }

    replyWithHTML(
      i18n.t('getLocation'),
      Extra
        .markup(Markup.keyboard([
          [Markup.locationRequestButton(i18n.t('buttons.sendLocation'))]
        ]).resize().oneTime())
    )

    session.number = String(message.text || message.contact.phone_number).replace("+", "")
    return wizard.next()
  },

  async ({ scene, session, message, i18n, replyWithHTML, telegram }) => {
    if (message.text == '/start') {
      return scene.enter('super-wizard')
    }

    if (!message.location) {
      return replyWithHTML(
        i18n.t('getLocation'),
        Extra
          .markup(Markup.keyboard([
            [Markup.locationRequestButton(i18n.t('buttons.sendLocation'))]
          ]).resize().oneTime())
      )
    }

    replyWithHTML(
      i18n.t('thanks'),
      Extra
        .markup(Markup.removeKeyboard(true))
      )

    telegram.sendMessage(
      data.chatId, 
      i18n.t(
        'newUser', {
          name: session.name,
          number: session.number
        }
      ),
      Extra
        .markup(Markup.inlineKeyboard([
          [Markup.callbackButton(i18n.t('getLocation'), `loc_${message.location.latitude}_${message.location.longitude}`)]
        ]))  
    )

    scene.leave()
  }

)

module.exports = superWizard